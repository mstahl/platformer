/** 
 * platformer-classes.js
 * 
 * Additional class hierarchy for the making of a platformer game.
 */

var defaults = {
  tile_width: 70,
  tile_height: 170
};

var Tile = function (url, options = {}) {
  $.extend(true, this, {
    // Default options
    id: -1,
    name: 'unnamed tile',
    flags: {
      solid: true      // If true, the player cannot pass through this tile
    },
    image: new Image(defaults.tile_width, defaults.tile_height)
  }, options);
  this.image.src = url;
};

