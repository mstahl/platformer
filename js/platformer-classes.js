/** 
 * platformer-classes.js
 * 
 * Additional class hierarchy for the making of a platformer game.
 */

// Some defaults, accessible to all scripts
window.defaults = {
  // Tile variables
  tile_width: 100,
  tile_height: 40,

  // Physics variables
  gravity: 0.98,     // Acceleration due to gravity (per tick)
  max_velocity_x: 10,
  max_velocity_y: 15,
  player_acceleration: 0.65,
  friction: 0.80
};

// All the sprite types in platformer are descended from TileSprite, a
// subprototype of the Villainous Gaming Library's Sprite prototype. TileSprite
// adds the physics (such as gravity) of the level in which you're playing. It
// is the code in TileSprite.before_move that primes the tile-related values in
// TileSprite, and also decides if the sprite is falling, for instance. It also
// handles the tile-friendly redrawing function for this world.
var TileSprite = function () {
  this.level = [];
  this.tileset = [];
  this.offset = {
    x1: 0,
    x2: defaults.tile_width,
    y1: 0,
    y2: defaults.tile_height
  };
  this.collision_with = {
    top: false,
    bottom: false,
    left: false,
    right: false
  };
  this.acceleration = {
    left: false,
    right: false
  };
};
TileSprite.prototype = new Sprite();
TileSprite.prototype.redraw = function (c) {
  c.save();
  c.translate(this.position.x, this.position.y);
  c.translate(0, -130);
  
  if(this.velocity.x < 0) {
    c.translate(100,0);
    c.scale(-1,1);
  }
  
  c.drawImage(this.image, 0, 0);
  c.restore();
};
TileSprite.prototype.before_move = function () { return true; };
TileSprite.prototype.after_move = function () { return true; };
TileSprite.prototype.move = function () {
  this.before_move();

  // Various utility locals
  var x1 = this.position.x + this.offset.x1 + this.velocity.x,
      x2 = this.position.x + this.offset.x2 + this.velocity.x,
      
      w = defaults.tile_width,
      h = defaults.tile_height;
  
  // Reset the collision variables. These will remain set however they're set
  // in this function until they're cleared before the next move, so they can
  // be safely used with confidence in before_move() and after_move() methods.
  // Be warned that since they're set in move(), their values in any before_move()
  // function will be from the *previous* tick of the game.
  this.collision_with = {
    left: false,
    right: false,
    top: false,
    bottom: false
  };
  
  // Apply gravity
  this.velocity.y += defaults.gravity;

  // Correct for excess velocity in any direction
  if(Math.abs(this.velocity.x) > defaults.max_velocity_x)
    this.velocity.x = (this.velocity.x / Math.abs(this.velocity.x)) * defaults.max_velocity_x;
  if(Math.abs(this.velocity.y) > defaults.max_velocity_y)
    this.velocity.y = (this.velocity.y / Math.abs(this.velocity.y)) * defaults.max_velocity_y;
  
  // Test for leaving the boundaries of the world
  if(x1 <= 0) {
    this.position.x = -this.offset.x1;
    this.velocity.x = 0;
    this.collision_with.left = true;
  }
  else if(x2 >= this.level.length * w) {
    this.position.x = this.level.length * w - this.offset.x2;
    this.velocity.x = 0;
    this.collision_with.right = true;
  }
  
  if(this.position.y >= this.level[0].length * h) {
    this.position.y = this.level[0].length * h;   // This really ought to kill the player... just sayin'
    this.velocity.y = 0;
    this.collision_with.bottom = true;
  }
  
  if(this.velocity.x > 0) {
    // Sprite is moving to the right
    var x = this.position.x + this.offset.x2 + this.velocity.x;
    for(var y = this.position.y + 30; y > this.position.y - 119; y -= 10) {
      var i = Math.floor(x / w),
          j = Math.floor(y / h);
      if(i < this.level.length && this.level[i][j] !== 0 && this.tileset[this.level[i][j] - 1].type === 'solid') {
        // There is a tile to the right of us somewhere
        this.velocity.x = 0;
        this.position.x = i * w - this.offset.x2;
        this.collision_with.right = true;
        break;
      }
    }
  }
  else if(this.velocity.x < 0) {
    // Sprite is moving to the left
    var x = this.position.x + this.offset.x1 + this.velocity.x;
    for(var y = this.position.y + 30; y > this.position.y - 119; y -= 10) {
      var i = Math.floor(x / w),
          j = Math.floor(y / h);
      if(i >= 0 && this.level[i][j] !== 0 && this.tileset[this.level[i][j] - 1].type === 'solid') {
        // There is a tile to the left of us somewhere
        this.velocity.x = 0;
        this.position.x = i * w + w - this.offset.x1;
        this.collision_with.left = true;
        break;
      }
    }
  }
  
  if(this.velocity.y > 0) {
    // Sprite is falling
    var y = this.position.y + this.velocity.y + 40;
    for(var x = this.position.x + this.offset.x1; x < this.position.x + this.offset.x2; x += w / 4) {
      var i = Math.floor(x / w),
          j = Math.floor(y / h);
      if(j < this.level[0].length && this.level[i][j] !== 0 && this.tileset[this.level[i][j] - 1].type === 'solid') {
        // There is a tile directly beneath us.
        this.velocity.y = 0;
        this.position.y = j * h - 40;
        this.collision_with.bottom = true;
        break;
      }
    }
  }
  else if(this.velocity.y < 0) {
    // Sprite is jumping
    var y = this.position.y - (170 - this.offset.y1);
    for(var x = this.position.x + this.offset.x1; x < this.position.x + this.offset.x2; x += w / 4) {
      var i = Math.floor(x / w),
          j = Math.floor(y / h);
      if(j >= 0 && this.level[i][j] !== 0 && this.tileset[this.level[i][j] - 1].type === 'solid') {
        // There is a tile directly above us.
        this.velocity.y = 0;
        this.position.y = j * h + this.offset.y1;
        this.collision_with.top = true;
        break;
      }
    }
  }
  
//  if(!this.collision_with.left && !this.collision_with.right)
  this.position.x = this.position.x + this.velocity.x;
//  if(!this.collision_with.top && !this.collision_with.bottom)
  this.position.y = this.position.y + this.velocity.y;
  
  this.after_move();
  
  return true;
}

var Player = function () {
  this.num_lives = 5;
  this.position.x = 20;
  this.position.y = 20;
  this.velocity = {
    x: 0,
    y: 0
  };
  this.image = new Image();
  this.image.src = 'images/sprites/Character Princess Girl.png';
  this.offset = {
    x1: 13,
    x2: 89,
    
    y1: 32,
    y2: 138
  };
  this.acceleration = {
    left: false,
    right: false
  };
};
Player.prototype = new TileSprite();
Player.prototype.before_move = function () {
  // React to the player's controls here
  if(this.acceleration.left)
    this.velocity.x = this.velocity.x - defaults.player_acceleration;
  else if(this.acceleration.right)
    this.velocity.x = this.velocity.x + defaults.player_acceleration;
  
  if(this.velocity.x > defaults.max_velocity_x)
    this.velocity.x = defaults.max_velocity_x;
  
  return true;
};
Player.prototype.after_move = function () {
  // If the player is on the ground, use friction to slow it down.
  if(this.collision_with.bottom && !(this.acceleration.left || this.acceleration.right)) {
    this.velocity.x = this.velocity.x * defaults.friction;
  }
};

var Bug = function (options) {
  $.extend(this, {
    position: {
      x: 20,
      y: 20
    },
    velocity: {
      x: 1.0,
      y: 0.0
    },
    offset: {
      x1: 3,
      x2: 97,
      y1: 80,
      y2: 138
    }
  }, options);
  this.image = new Image();
  this.image.src = 'images/sprites/Enemy Bug.png';
};
Bug.prototype = new TileSprite();
Bug.prototype.after_move = function () {
  var x1 = this.position.x + this.offset.x1 - 3,    // Lookahead for tiles is 3px
      x2 = this.position.x + this.offset.x2 + 3,    // Lookbehind too
      y1 = this.position.y + 40 - 3,
      y2 = this.position.y + 40 + 3,                // This is to look for cliffs
      
      i1 = Math.floor(x1 / defaults.tile_width),
      i2 = Math.floor(x2 / defaults.tile_width),
      j1 = Math.floor(y1 / defaults.tile_height),
      j2 = Math.floor(y2 / defaults.tile_height);
  
  if(
      // Obstruction to the left
      this.level[i1][j1] !== 0 ||
      // Obstruction to the right
      this.level[i2][j1] !== 0 ||
      // Cliff edge to the left. Must have no obstruction to left.
      (this.level[i1][j1] === 0 && this.level[i1][j2] === 0) ||
      // Cliff edge to the right. Must have no obstruction to right.
      (this.level[i2][j1] === 0 && this.level[i2][j2] === 0)
    ) {
    this.velocity.x = -this.velocity.x;
  }
};







