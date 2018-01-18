![steamlogo](https://i.imgur.com/vExtRT4.png)

# Version 1.0.5
# steam-deal-crawler

> Tired of adding every game from one genre to your wishlist on steam, just to be notified, when one will be on discount?

## About
This nodeJs-Bot is a simple crawler to search through a specific Tag you always wanted to have 

This node-js crawler searches through a tag-name and lists every discount with percentage and price. The export of the result is on your side. 

## Features
- Lookup every discounted item in the steam-shop
- Filter through tags
- Export into temporary json-datafile
- Executing in intervals
- Export into specific export-type [JSON, HTML, XML]
- Send new items to discord-webhook

## Planed Features
- dynamic export/saved files
- category-id finder

## First Use
Please execute the following command first, to get you /node_modules/ folder and the required modules
```bash
npm update
```
## How to use
#### if you need help
```bash
node bot.js -h
```
#### output
```bash
  -h, --help            Show this help message and exit.
  -v, --version         Show programs version number and exit.

  -m {>= 5}, --minutes {>= 5}
                        Process-Interval in minutes -> min value is 5
                        [DEFAULT: 60]

  -i {true,false}, --interval {true,false}
                        determine if the process should be executed in an
                        interval, or just once [DEFAULT: false]
                        
  -l {true,false}, --log {true,false}
                        Log actions into a seperate file for each day
                        [DEFAULT: true]

  -e {JSON,HTML,XML}, --export {JSON,HTML,XML}
                        Log actions into a seperate file for each day
                        [DEFAULT: found in ./config.json]                   
```

## Config
To switch the notification-type just use the `./data/config.json`.

On my example i used the `recommended` list from [Steam](http://store.steampowered.com/tag/browse/) itself. If you clink on an tag on the left list, you are able to retrieve your tag-ids:

- `http://store.steampowered.com/tag/browse/#recommended_4085` -> 4085
- `http://store.steampowered.com/tag/browse/#recommended_6650` -> 6650
- `http://store.steampowered.com/tag/browse/#recommended_3843` -> 3843
- `http://store.steampowered.com/tag/browse/#recommended_3964` -> 3964

And so on... 

These ids will be used in the config.

### Empty-Config

```json
{
    "saveConfig": {
        "filePath": "./data/saved.json",
        "logPath": "./logs/",
        "exportType": "JSON",
        "useWebHook": false,
        "webHook": [
            "https://discordapp.com/api/webhooks/XXXXXXXXXXXXXXXXXX/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        ]
    },
    "tag_id_list": [{
        "id": 1,
        "name": "Tag_Name",
        "taglist": []
    }, {
        "id": 2,
        "name": "Tag_Name"
    }]
}
```

### Filled-Example
```json
{
    "saveConfig": {
        "filePath": "./data/saved.json",
        "logPath": "./logs/",
        "exportType": "JSON",
        "useWebHook": true,
        "webHook": [
            "https://discordapp.com/api/webhooks/403612757053931529/pfevSig6fTX8dThDkx9AHFQztqQ1CJnFM7B9RrUQtbJqcGuJRfS9H8pTHs7OGjpqIqNt"
        ]
    },
    "tag_id_list": [{
        "id": 4085,
        "name": "Anime",
        "taglist": []
    }, {
        "id": 3968,
        "name": "Physik",
        "taglist": []
    }]
}
```

## node-js-modules

- request
- jsdom
- jquery
- fs
- url
- argparse
- xml
- restler

## License 
    The MIT License (MIT)
    
    Copyright (c) 2014 - 2015
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
