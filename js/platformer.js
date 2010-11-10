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
    gravity: 0.1,     // Acceleration due to gravity (per tick)
    terminal_velocity: 5
  };
  
  // Classes
  // var Player = function () {
  //   this.num_lives = 5;
  //   this.position.x = 20;
  //   this.position.y = 0;
  // };
  // Player.prototype = new Sprite();
  // Player.prototype.before_move = function () {
  //   // Adjust velocity, for gravity
  //   this.velocity.y += defaults.gravity;
  //   if(this.velocity.y > defaults.terminal_velocity) {
  //     this.velocity.y = defaults.terminal_velocity;
  //   }
  // };
  
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
  });
  
  // Load tiles
  console.log('loading tiles');
  $.getJSON('js/tileset.json', function (data, status, xhr) {
    tileset = $.map(data, function (t, i) {
      t.image_src = t.image;
      var img = new Image();
      img.src = t.image_src;
      t.image = img;
      return t;
    });
    console.log('tiles loaded');
    
    // Load level
    console.log('loading level');
    $.getJSON('js/level.json', function (data, status, xhr) {
      level = data;
      game.state('intro').run();
      console.log('level loaded');
    });
  });
  
  // var player = new Player();
  
});