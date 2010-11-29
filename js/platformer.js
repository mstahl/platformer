/**
 * platformer.js
 * 
 * A classic arcade style game.
 */

$(function () {
  var defaults = {
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
  
  // Classes
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
      y2: 111
    };
    this.acceleration = {
      left: false,
      right: false
    };
  };
  Player.prototype = new Sprite();
  Player.prototype.redraw = function (ctx) {
    with(ctx) {
      save();
      translate(0, -130);
      drawImage(this.image, this.position.x, this.position.y);
      restore();
    };
  };
  
  // Game variables.
  var game = new Game();
  var contexts = [
    document.getElementById('screen-0').getContext('2d'), 
    document.getElementById('screen-1').getContext('2d')
  ];
  var context_i = 0;
  var tileset = [];
  var level = [];
  var scroll = 0;
  
  var draw_level = function (l, c) {
    for(var x = 0; x < level.length; ++x) {
      for(var y = level[x].length - 1; y >= 0; --y) {
        if(l[x][y] !== 0) {
          c.save();
          c.translate(0, -130);
          c.drawImage(tileset[l[x][y] - 1].image, x * 100, y * 40);
          c.restore();
        }
      }
    }
  };
  
  game.state('intro', {
    onenter: function (from) {
      $(window).bind('keypress', function (e) {
        switch(e.keyCode) {
          default:
            game.state('playing');
        }
      });
      
      // Draw the level, but not the player yet
      with(contexts[0]) {
        fillStyle = 'rgb(0,0,0)';
        fillRect(0, 0, 800, 600);
      };
      draw_level(level, contexts[0]);
    },
    onloop: function () {
      return true;
    },
    onleave: function (to) {
      $(window).unbind();
    }
  })
  .state('playing', {
    onenter: function (from) {
      if(from === 'intro') {
        game.player = new Player();
      }
      
      $(window).bind('keydown', function (e) {
        switch(e.keyCode) {
          case 87:      // 'w'
          case 38:      // 'up'
            // don't do anything yet
            break;
          case 65:      // 'a'
          case 37:      // 'left'
            // game.player.velocity.x = -3;
            game.player.acceleration.left = true;
            game.player.acceleration.right = false;
            return false;
          case 83:      // 's'
          case 40:      // 'down'
            // don't do anything yet
            break;
          case 68:      // 'd'
          case 39:      // 'right'
            // game.player.velocity.x = 3;
            game.player.acceleration.left = false;
            game.player.acceleration.right = true;
            return false;
          case 32:      // 'space'
            if(game.player.velocity.y < 1.0) {
              game.player.velocity.y = -20;
            }
            return false;
          default:
            return true;
        }
      })
      .bind('keyup', function (e) {
        switch(e.keyCode) {
          case 65:      // 'a'
          case 37:      // 'left'
            game.player.acceleration.left = false;
            break;
          case 68:      // 'd'
          case 39:      // 'right'
            game.player.acceleration.right = false;
            return false;
        }
      });
    },
    onloop: function () {
      // Perform the canvas swap
      $("#screen-" + (1 - context_i)).show();
      $("#screen-" + context_i).hide();
      context_i = 1 - context_i;
      var context = contexts[context_i];
    
      // Clear the screen
      with(context) {
        fillStyle = 'rgb(0,0,0)';
        fillRect(0, 0, 800, 600);
      };
      
      // Adjust the scrolling of the screen, according to the player's position
      scroll = game.player.position.x - 400;
      if(scroll < 0) scroll = 0;
      context.save();
      context.translate(-scroll, 0);
      
      // Draw the level's tiles
      draw_level(level, context);
      
      // Apply gravity
      game.player.velocity.y = game.player.velocity.y + defaults.gravity;
      // Apply forces from the controls
      if(game.player.acceleration.left) {
        game.player.velocity.x = game.player.velocity.x - defaults.player_acceleration;
      }
      else if(game.player.acceleration.right) {
        game.player.velocity.x = game.player.velocity.x + defaults.player_acceleration;
      }
      // Handle the excesses of Sweet Lady Physics
      if(Math.abs(game.player.velocity.x) > defaults.max_velocity_x)
        game.player.velocity.x = (game.player.velocity.x / Math.abs(game.player.velocity.x)) * defaults.max_velocity_x;
      if(Math.abs(game.player.velocity.y) > defaults.max_velocity_y)
        game.player.velocity.y = (game.player.velocity.y / Math.abs(game.player.velocity.y)) * defaults.max_velocity_y;
      
      // Handle player's collision with the world around it and also move it.
      var x1 = game.player.position.x + game.player.offset.x1 + game.player.velocity.x,
          x2 = game.player.position.x + game.player.offset.x2 + game.player.velocity.x,
          y1 = game.player.position.y + game.player.velocity.y,
          y2 = y1 - 80 + game.player.velocity.y,
          w = defaults.tile_width,
          h = defaults.tile_height,
          v = game.player.velocity;
      // First test for collisions with the outer edges of the world
      if(x1 < 0) {
        game.player.velocity.x = 0;
        game.player.position.x = -game.player.offset.x1;
      }
      else if(x2 > level.length * w) {
        game.player.velocity.x = 0;
        game.player.position.x = level.length * w - game.player.offset.x2;
      }
      if(y2 < 0) {
        game.player.velocity.y = 0;
        game.player.position.y = 80;
      }
      else if(y1 > 600) {
        game.player.velocity.y = 0;
        game.player.position.y = 600;
      }
      else {
        // Handle collisions with tiles here
        var i1 = Math.floor(x1 / w),
            i2 = Math.floor(x2 / w),
            j1 = Math.floor(y1 / h),
            j2 = Math.floor(y2 / h);
        if(v.x > 0) {
          if(level[i2][j1] !== 0 || level[i2][j2] !== 0) {
            game.player.velocity.x = 0;
            game.player.position.x = i2 * w - game.player.offset.x2;
          }
        }
        else if(v.x < 0) {
          if(level[i1][j1] !== 0 || level[i1][j2] !== 0) {
            game.player.velocity.x = 0;
            game.player.position.x = i1 * w + game.player.offset.x2 - 2;
          }
        }
        // And in the vertical direction
        if(v.y > 0) {
          if(level[i1][j1 + 1] !== 0 || level[i2][j1 + 1] !== 0) {
            game.player.velocity.y = 0;
            game.player.position.y = j1 * h;
            
            // If the player is not holding down one of the acceleration keys,
            // rob a little velocity due to friction here. Later on, this can
            // be replaced with the coefficient of kinetic friction of the material
            // that the tile we just tested is made of.
            if(!game.player.acceleration.left && !game.player.acceleration.right)
              game.player.velocity.x = game.player.velocity.x * defaults.friction;
          }
        }
        else if(v.y < 0) {
          if(level[i1][j2] !== 0 || level[i2][j2] !== 0) {
            game.player.velocity.y = 0;
            game.player.position.y = j1 * h;
          }
        }
        game.player.move();
      }
      
      game.player.redraw(context);
      
      context.restore();    // Restored from scrolling translation at top of function
    },
    onleave: function (to) {
      game.player = null;
    }
  });
  
  // Load tiles
  // console.log('loading tiles');
  $.getJSON('js/tileset.json', function (data, status, xhr) {
    tileset = $.map(data, function (t, i) {
      t.image_src = t.image;
      var img = new Image();
      img.src = t.image_src;
      t.image = img;
      return t;
    });
    // console.log('tiles loaded');
    
    // Load level
    // console.log('loading level');
    $.getJSON('js/level.json', function (data, status, xhr) {
      level = data;
      game.state('intro').run();
      // console.log('level loaded');
    });
  });
});
