# THIS ONE IS UNDER DEVELOPEMENT
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

## Planed Features
- Export into specific export-type

## How to use
#### basic
```bash
node bot.js 
```
> starts only once and logs actions
#### interval
```bash
node bot.js 5
```
> starts in an interval of 5 minutes, parameter is expected as minutes and be > 5
#### logging
```bash
node bot.js 5 false
```
> starts in an interval and without logging


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
        "exportType": "JSON"
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
        "exportType": "JSON"
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
