/**
 * platformer.js
 * 
 * A classic arcade style game.
 */

$(function () {
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
        game.player.level = level;
        game.player.tileset = tileset;
        
        // Initialize enemies
        game.enemies = [];
        for(var i = 0; i < level.length; ++i) {
          for(var j = 0; j < level[i].length; ++j) {
            if(level[i][j] !== 0 && tileset[level[i][j] - 1].type === 'enemy') {
              level[i][j] = 0;    // Delete the enemy from the level.
              game.enemies.push(new Bug({
                position: {
                  x: i * defaults.tile_width,
                  y: j * defaults.tile_height
                },
                level: level,
                tileset: tileset
              }));
            }
          }
        }
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
            if(game.player.collision_with.bottom) {
              game.player.velocity.y = -20;
              game.player.collision_with.bottom = false;
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
      
      game.player.move();
      
      game.player.redraw(context);
      
      for(var i in game.enemies) {
        game.enemies[i].move();
        game.enemies[i].redraw(context);
      }
      
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
