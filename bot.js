//node-modules
var request = require('request');
var jsdom = require("jsdom");
var dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
var $ = require("jquery")(dom.window);

/**
  Anime-Subsection
*/
function findDiscountsWithPerTag(tagId, pageResults, specificTagList) {

    if (typeof pageResults === 'undefined') { pageResults = 0; }
    if (typeof specificTagList === 'undefined') { specificTagList = ""; }

    var extraTagList = "";

    if (typeof specificTagList !== 'undefined') {
        "tag[]=" + test.join("&tag[]=") + "&";
    }

    var options = {
        url: 'http://store.steampowered.com/tagdata/querypaginated/de/' + tagId + '/Discounts/render/?query=&start=' + pageResults + '&count=10&cc=DE&l=german&no_violence=0&no_sex=0&v=4',
        method: 'GET',
        json: true
    }
    request(options, function(error, response, json_body) {
        if (error) { console.log(error); } else {
            body = "<div>" + json_body["results_html"] + "</div>";

            console.log("> Checking Discount-Page number " + ((pageResults + 10) / 10) + " for the Tag: " + tagId);

            $(body).find('a').each(function(index, game) {
                var name = $(game).find('div.tab_item_content > div.tab_item_name').text();
                var price = $(game).find('div.discount_block > div.discount_prices > div.discount_final_price').text()
                var discount = $(game).find('div.discount_block > div.discount_pct').text()
                console.log("The game >>" + name + "<< is reduced by " + discount + " to " + price + ".");
            });

            if (json_body["total_count"] >= pageResults + 10) {
                console.log("There are more pages to go to...");
                findDiscountsWithPerTag(tagId, pageResults + 10, specificTagList);
            }

        }
    });

}

findDiscountsWithPerTag(4085, 0, [3799]);