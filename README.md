# galactic-strike

This is the interface through which players will enter their guess for the game : Temple of Anubis.

## Gameplay

Lock row and column movement with Q and D, then press S to fire.
Find all the ships and score points to win the game.


## Scripts

- background : simple script to manage the video background
- timer : simple script to manage the timer
- translation : simple script to manage the translations
- sounds : module script to manage the sounds
- signals : module script to manage the signals send to QT
- main : module script with minimum game logic
- cursor : module script to manage the cursor movements
- constants : module script with game constants
- utils : module script with game utils functions
- Ship : class representing a ship object with various associated functions
- Grid : class representing the game grid with various associated functions

## Sounds

Please check `src/data/sfx.json` for more details.

- name : fire.mp3, id : 1
- name : laser_hit.mp3, id : 2
- name : laser_miss.mp3, id : 3
- name : ship_explosion.mp3, id : 4

## Translation

A lang param is expected in the url. If no lang param is provided, the default lang is `fr`.

The translations are stored in the `src/data/translations/translations.${lang}.json` file.

For more details on how to use the translations, please check the `src/js/translation.js` file.

## Debug

The debug mode is activated when the `debug` param is set to `true` in the url.
Symbols current mappings will be displayed, as well as the current light configuration.