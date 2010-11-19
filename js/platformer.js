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
    gravity: 0.50,     // Acceleration due to gravity (per tick)
    terminal_velocity: 15
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
  var context = document.getElementById('screen').getContext('2d');
  var tileset = [];
  var level = [];
  
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
      with(context) {
        fillStyle = 'rgb(0,0,0)';
        fillRect(0, 0, 800, 600);
      };
      draw_level(level, context);
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
            game.player.velocity.x = -3;
            return false;
          case 83:      // 's'
          case 40:      // 'down'
            // don't do anything yet
            break;
          case 68:      // 'd'
          case 39:      // 'right'
            game.player.velocity.x = 3;
            return false;
          case 32:      // 'space'
            if(game.player.velocity.y < 1.0) {
              game.player.velocity.y = -10;
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
          case 68:      // 'd'
          case 39:      // 'right'
            game.player.velocity.x = 0;
            return false;
        }
      });
    },
    onloop: function () {
      // Clear the screen
      with(context) {
        fillStyle = 'rgb(0,0,0)';
        fillRect(0, 0, 800, 600);
      };
      
      // Draw the level's tiles
      draw_level(level, context);
      
      // Apply gravity
      game.player.velocity.y = game.player.velocity.y + defaults.gravity;
      
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
            game.player.position.x = i1 * w - game.player.offset.x1;
          }
        }
        // And in the vertical direction
        if(v.y > 0) {
          if(level[i1][j1 + 1] !== 0 || level[i2][j1 + 1] !== 0) {
            game.player.velocity.y = 0;
            game.player.position.y = j1 * h;
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
