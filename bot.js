//node-modules
var request = require('request');
var jsdom = require("jsdom");
var dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
var $ = require("jquery")(dom.window);
var fs = require('fs');

/*
  argument-validation
  arg1 = INTERVAL in minutes -> min = 5
  arg2 = logActions
*/
const GLOBALS = {
    T_INTERVAL: process.argv[2] !== undefined ? process.argv[2] < 5 ? (60000 * 5) : (process.argv[2] * 60000) : (60000 * 60),
    T_INTERVAL_SET: process.argv[2] !== undefined ? true : false,
    LOG_ACTIONS: process.argv[3] !== undefined ? process.argv[3] : true
}

//global variables
const CONFIG = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const SETTINGS = {
    FILE_PATH: CONFIG.saveConfig.filePath,
    LOG_PATH: CONFIG.saveConfig.logPath,
    ID_ARRAY: CONFIG.tag_id_list,
    EXPORT_TYPE: CONFIG.saveConfig.exportType,
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
            //console.log("> Checking Discount-Page number " + ((pageResults + 10) / 10) + " for the Tag: " + tagId);

            $(body).find('a').each(function(index, game) {
                var name = $(game).find('div.tab_item_content > div.tab_item_name').text();
                var price = $(game).find('div.discount_block > div.discount_prices > div.discount_final_price').text();
                var discount = $(game).find('div.discount_block > div.discount_pct').text();
                // console.log("The game >>" + name + "<< is reduced by " + discount + " to " + price + ".");

                if (!globalVariables.gamesWithDiscound.hasOwnProperty(tagId)) {
                    globalVariables.gamesWithDiscound[tagId] = [];
                }

                globalVariables.gamesWithDiscound[tagId].push({ game_name: name, game_price: price, game_discount: discount });
            });

            if (json_body["total_count"] >= pageResults + 10) {
                //console.log("There are more pages to go to...");
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

                            if (single_saved_obj.game_name == single_obj.game_name) {
                                newEntry = false;
                            }

                        });
                    }

                    if (newEntry && SETTINGS.INITIALIZE_OLDITEMS) {
                        var singleLogMessage = "[NEW] " + single_obj.game_name + " with " + single_obj.game_discount + " to " + single_obj.game_price;
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

        globalVariables.globalTagList = {};
        globalVariables.callBackCount = 0;
        globalVariables.gamesWithDiscound = {};
    }
}

//logging-helper
function logAction(content) {
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

                break;
            case "XML":

                break;
            case "WEBHOOK":

                break;
            default:
                console.log(single_type + " is not a valid Export-Type.");
                break;
        }
    });
}

//RUN
if (GLOBALS.T_INTERVAL_SET) {
    execute();
    setInterval(function() { execute(); }, GLOBALS.T_INTERVAL);
} else {
    execute();
}