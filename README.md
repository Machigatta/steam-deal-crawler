# steam-deal-crawler

> Tired of adding every game from one genre to your wishlist on steam, just to be notified, when one will be on discount?

## About
This nodeJs-Bot is a simple crawler to search through a specific Tag you always wanted to have 

This node-js crawler searches through a tag-name and lists every discount with percentage and price. The export of the result is on your side. 

## Features
- Able to read the lists

## Config
To switch the notification-type just use the `config.json`.

On my example i used the `recommended` list from <a href="http://store.steampowered.com/tag/browse/">Steam</a> itself. If you clink on an tag on the left list, you are able to retrieve your tag-ids:

- `http://store.steampowered.com/tag/browse/#recommended_4085` -> 4085
- `http://store.steampowered.com/tag/browse/#recommended_6650` -> 6650
- `http://store.steampowered.com/tag/browse/#recommended_3843` -> 3843
- `http://store.steampowered.com/tag/browse/#recommended_3964` -> 3964

And so on... 

These ids will be used in the config.

## node-js-modules

- request
- jsdom
- jquery