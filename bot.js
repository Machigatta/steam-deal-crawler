//node-modules
var request = require('request');
var jsdom = require("jsdom");
var dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
var $ = require("jquery")(dom.window);
var fs = require('fs');
var url = require('url');
var xml = require('xml');
var rest = require('restler');
var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'This node-js crawler searches through a steam-tag-name and lists every discount with percentage and price. The export of the result is on your side.'
});
parser.addArgument(
    ['-m', '--minutes'], {
        help: 'Process-Interval in minutes -> min value is 5 [DEFAULT: 60]',
        type: 'int',
        choices: [">= 5"]
    }
);
parser.addArgument(
    ['-i', '--interval'], {
        help: 'determine if the process should be executed in an interval, or just once [DEFAULT: false]',
        choices: ["true", "false"]
    }
);
parser.addArgument(
    ['-l', '--log'], {
        help: 'Log actions into a seperate file for each day [DEFAULT: true]',
        choices: ["true", "false"]
    }
);
parser.addArgument(
    ['-e', '--export'], {
        help: 'Log actions into a seperate file for each day [DEFAULT: found in ./config.json]',
        choices: ["JSON", "HTML", "XML"]
    }
);
var args = parser.parseArgs();

//globals
const GLOBALS = {
        T_INTERVAL: args.minutes !== null ? args.minutes < 5 ? (60000 * 5) : (args.minutes * 60000) : (60000 * 60),
        T_INTERVAL_SET: args.interval !== null ? !(args.minutes == 'true') : false,
        LOG_ACTIONS: args.log !== null ? !(args.log == 'false') : true
    }
    //global variables
const CONFIG = JSON.parse(fs.readFileSync('./data/config.json', 'utf8'));
const SETTINGS = {
    FILE_PATH: CONFIG.saveConfig.filePath,
    LOG_PATH: CONFIG.saveConfig.logPath,
    ID_ARRAY: CONFIG.tag_id_list,
    EXPORT_TYPE: args.export !== null ? args.export : CONFIG.saveConfig.exportType,
    INITIALIZE_OLDITEMS: true,
    DEBUG: true
}
var globalVariables = {
    globalTagList: {},
    callBackCount: 0,
    gamesWithDiscound: {},
    today: null,
    todayDate: null
}


//main function for recursive iteration through results
function findDiscountsWithPerTag(object, pageResults) {
    if (typeof pageResults === 'undefined') { pageResults = 0; }

    var tagId = object.id;
    var specificTagList = object.taglist;
    globalVariables.globalTagList[tagId] = object.name;
    var extraTagList = "";

    //taglists are used to filter-results even further
    if (typeof specificTagList !== 'undefined' && specificTagList.length > 0) {
        $(specificTagList).each(function(i, el) {
            extraTagList += "&tag[" + i + "]=" + el;
        })
    }

    //request-options 
    var options = {
        url: 'http://store.steampowered.com/tagdata/querypaginated/de/' + tagId + '/Discounts/render/?query=&start=' + pageResults + '&count=10&cc=DE&l=german&no_violence=0&no_sex=0&v=4' + extraTagList,
        method: 'GET',
        json: true
    }
    request(options, function(error, response, json_body) {
        if (error) { console.log(error); } else {
            body = "<div>" + json_body["results_html"] + "</div>";
            $(body).find('a').each(function(index, game) {
                //to cut the '?snr=1_237_1600__106_5' from the url and minimize the data
                var myurl = url.parse($(game).attr("href"), true);
                var v_link = myurl.host + myurl.pathname;
                var v_id = $(game).data("ds-appid");
                var v_name = $(game).find('div.tab_item_content > div.tab_item_name').text();
                var v_price = $(game).find('div.discount_block > div.discount_prices > div.discount_final_price').text();
                var v_discount = $(game).find('div.discount_block > div.discount_pct').text();
                if (!globalVariables.gamesWithDiscound.hasOwnProperty(tagId)) {
                    globalVariables.gamesWithDiscound[tagId] = [];
                }

                globalVariables.gamesWithDiscound[tagId].push({ _id: v_id, _name: v_name, _price: v_price, _discount: v_discount, _link: v_link });
            });

            if (json_body["total_count"] >= pageResults + 10) {
                findDiscountsWithPerTag(object, pageResults + 10);
            } else {
                callBack();
            }

        }
    });

}

//callBack and logging/exporting data
function callBack() {
    globalVariables.callBackCount++;
    if (SETTINGS.ID_ARRAY.length == globalVariables.callBackCount) {
        var saved_data_string = fs.readFileSync(SETTINGS.FILE_PATH, 'utf8');
        var saved_data = JSON.parse(saved_data_string == "" ? "{}" : saved_data_string);
        if (GLOBALS.LOG_ACTIONS) {

            var i = 0;

            for (var key in globalVariables.gamesWithDiscound) {
                if (!globalVariables.gamesWithDiscound.hasOwnProperty(key)) continue;

                var obj = globalVariables.gamesWithDiscound[key];
                var logMessage = "[STATUS] Found " + obj.length + " reduced games for Category-Tag: " + globalVariables.globalTagList[key];
                logAction(logMessage);
                if (saved_data.hasOwnProperty(key)) {
                    var saved_obj = saved_data[key];
                }
                obj.forEach(function(single_obj) {
                    var newEntry = true;
                    if (saved_obj !== undefined) {

                        saved_obj.forEach(function(single_saved_obj) {

                            if (single_saved_obj._id == single_obj._id) {
                                newEntry = false;
                            }

                        });
                    }

                    if (newEntry && SETTINGS.INITIALIZE_OLDITEMS) {
                        var singleLogMessage = "[NEW] " + single_obj._name + " with " + single_obj._discount + " to " + single_obj._price;
                        var webHooks = CONFIG.saveConfig.webHook;
                        if(CONFIG.saveConfig.useWebHook){
                            webHooks.forEach(function(webHook) {
                                rest.postJson(webHook, {
                                    username: "steam-deal-crawler",
                                    embeds: [{
                                        title: single_obj._name,
                                        url: "http://" + single_obj._link,
                                        description: ("Discount of `" + single_obj._discount + " down to `" +single_obj._price + "`"),
                                        color: 244242,
                                        image: {
                                            url: "http://store.edgecast.steamstatic.com/public/shared/images/responsive/header_logo.png"
                                        }
                                    }]
                                }).on('complete', function(data, response) {
                                    if (response.statusCode == 201) {
                                        // you can get at the raw response like this...
                                    }
                                });
                            })
                        }
                        i++;
                        logAction(singleLogMessage);
                    }
                })
            }

            if (i > 0 && SETTINGS.INITIALIZE_OLDITEMS) {
                logAction("[END] " + i + " new Entrys.");
            } else {
                logAction("[END] Nothing new found.");
            }
        }
        fs.writeFile(SETTINGS.FILE_PATH, JSON.stringify(globalVariables.gamesWithDiscound), 'utf-8', function(err) {
            if (err) console.log(err);
        });

        exportData();
    }
}

//logging-helper
function logAction(content) {
    var dir = SETTINGS.LOG_PATH;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    content = globalVariables.todayDate + " " + content;
    var logFileName = SETTINGS.LOG_PATH + (globalVariables.today.getMonth() + 1) + '_' + globalVariables.today.getDate() + '_' + globalVariables.today.getFullYear() + '.log';
    SETTINGS.DEBUG ? console.log(content) : "";
    fs.appendFile(logFileName, content + "\n", 'utf-8', function(err) {
        if (err) console.log(err);
    });
}

//main-function
function execute() {
    globalVariables.today = new Date();
    globalVariables.todayDate = "[" + (globalVariables.today.getMonth() + 1) + '/' + globalVariables.today.getDate() + '/' + globalVariables.today.getFullYear() + " " + (globalVariables.today.getHours() < 10 ? "0" + globalVariables.today.getHours() : globalVariables.today.getHours()) + ":" + (globalVariables.today.getMinutes() < 10 ? "0" + globalVariables.today.getMinutes() : globalVariables.today.getMinutes()) + "]";
    SETTINGS.DEBUG ? console.log(globalVariables.todayDate + " [START] Executing main-functionality") : "";
    SETTINGS.ID_ARRAY.forEach(function(object) {
        findDiscountsWithPerTag(object, 0);
    });
}

//export the result to a specific export-type
function exportData() {
    var types = SETTINGS.EXPORT_TYPE.split("|");
    types.forEach(function(single_type) {
        switch (single_type) {
            case "JSON":
                //exportData[tagId] = { _id, _name, _price, _discount, _link }
                fs.writeFile('./data/export/export_json.json', JSON.stringify(globalVariables.gamesWithDiscound), 'utf-8', function(err) {
                    if (err) console.log(err);
                });
                break;
            case "XML":
                var gwdXml = {};
                var gwdXmlObject = [];
                for (var key in globalVariables.gamesWithDiscound) {
                    var singleXmlObj = {};
                    var singleObj = globalVariables.gamesWithDiscound[key];
                    var ar = [];
                    singleObj.forEach(function(so, index) {
                        ar.push({ item: [{ _id: so._id }, { _name: so._name }, { _price: so._price }, { _discount: so._discount }, { _link: so._link }] });
                        singleXmlObj["items"] = ar;
                    });
                    gwdXmlObject.push({ tagname: [{ _attr: { attributes: key } }, singleXmlObj] });
                    gwdXml["tags"] = gwdXmlObject;
                }
                //exportData[tagId] = { _id, _name, _price, _discount, _link }
                fs.writeFile('./data/export/export_xml.xml', xml(gwdXml), 'utf-8', function(err) {
                    if (err) console.log(err);
                });
                break;
            case "HTML":
                var htmlContent = '<html><head><link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous"></head><body><div class="container"><table>';


                for (var key in globalVariables.gamesWithDiscound) {
                    var singleObj = globalVariables.gamesWithDiscound[key];
                    htmlContent += '<h1>Category: ' + globalVariables.globalTagList[key] + ' <small>(' + key + ')</small></h1>';
                    htmlContent += '<table class="table table-responsive table-bordered"><thead><tr><th>Game</th><th class="col-md-3">Discount</th><th class="col-md-3">New Price</th></tr></thead><tbody>';
                    singleObj.forEach(function(so, index) {
                        htmlContent += '<tr><td><a href="https://' + so._link + '">' + so._name + '</a></td><td> ' + so._discount + '</td><td>' + so._price + '</td></tr>';
                    });
                    htmlContent += '</tbody></table>';

                }
                htmlContent += '</div><body></html>';

                fs.writeFile('./data/export/export_html.html', htmlContent, 'utf-8', function(err) {
                    if (err) console.log(err);
                });
                break;
            default:
                console.log(single_type + " is not a valid Export-Type.");
                break;
        }
    });

    globalVariables.globalTagList = {};
    globalVariables.callBackCount = 0;
    globalVariables.gamesWithDiscound = {};
}

//RUN
if (GLOBALS.T_INTERVAL_SET) {
    execute();
    setInterval(function() { execute(); }, GLOBALS.T_INTERVAL);
} else {
    execute();
}