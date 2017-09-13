/*
  globals

  arg1 = saveToFile
  arg2 = sendToWebhook
  arg3 = logActions

*/
const SAVE_TO_FILE = process.argv[2] == true;
const SEND_TO_WEBHOOK = process.argv[3];
const LOG_ACTIONS = process.argv[4];

//node-modules
var request = require('request');
var jsdom = require("jsdom");
var dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
var $ = require("jquery")(dom.window);
var fs = require('fs');



var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const FILE_PATH = config.saveConfig.filePath;
const LOG_PATH = config.saveConfig.logPath;
const ID_ARRAY = config.tag_id_list;


var gamesWithDiscound = {};

function findDiscountsWithPerTag(tagId, pageResults, specificTagList) {

    if (typeof pageResults === 'undefined') { pageResults = 0; }
    if (typeof specificTagList === 'undefined') { specificTagList = []; }

    var extraTagList = "";

    if (typeof specificTagList !== 'undefined' && specificTagList.length > 0) {
        $(specificTagList).each(function(i, el) {
            extraTagList += "&tag[" + i + "]=" + el;
        })
    }

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

                if (!gamesWithDiscound.hasOwnProperty(tagId)) {
                    gamesWithDiscound[tagId] = [];
                }

                gamesWithDiscound[tagId].push({ game_name: name, game_price: price, game_discount: discount });
            });

            if (json_body["total_count"] >= pageResults + 10) {
                //console.log("There are more pages to go to...");
                findDiscountsWithPerTag(tagId, pageResults + 10, specificTagList);
            } else {
                callBack();
            }

        }
    });

}

var callBackCount = 0;

function callBack() {
    callBackCount++;
    if (ID_ARRAY.length == callBackCount) {
        console.log(gamesWithDiscound);

        if (SAVE_TO_FILE) {
            //To-Do Save result to file
        }
        if (SEND_TO_WEBHOOK) {
            //To-Do Send result to webhook
        }
    }

}

ID_ARRAY.forEach(function(object) {
    findDiscountsWithPerTag(object.id, 0, object.taglist);
})