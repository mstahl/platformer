/**
 * villainousgaming.js
 * 
 * The Villainous™ Gaming Library
 * 
 * (c) 2010 max thom stahl, villainous industries
 *
 */

// Console nerfing
if(typeof(window.console) === 'undefined') {
  window.console = {
    log: function () {},
    error: function () {},
    warn: function () {}
  };
}

/******************************************************************************
 * Game                                                                       *
 ******************************************************************************
   Games can instantiate the Game class to manage the state and various events
   of their gaming loop, sprites, etc.
 *****************************************************************************/
var Game = function () {
  // this.states is an object literal, each key of which is a state in the
  // state machine for this game. Each state has any of the following keys,
  // which are functions: onenter, onleave, onloop. The current state's
  // callbacks are called by the Game's main loop, defined below.
  this.states = {};
  this.current_state = null;
};
/*
 * Game.state()
 * 
 * Can be called either with one or two arguments. If it's called with one
 * String argument, it changes the current state to the state with that name.
 * If it's called with a String and an Object, it initializes a new state with
 * that name and options.
 */
Game.prototype.state = function (state, options) {
  if(typeof(state) === 'string') {
    // If a string was given as the first argument, this function should either
    // change state or add a new state.
    if(typeof(options) === 'object') {
      // Initialize a new state with this name and those options, merged with
      // a set of default nop() functions.
      this.states[state] = $.extend({
        onenter: function (from_state) { return false; },
        onloop : function () { return false; },
        onleave: function (to_state) { return false; }
      }, options);
      return this;
    }
    else if(typeof(options) === 'undefined' ) {
      if(this.states.hasOwnProperty(state)) {
        var old_state = this.current_state
            new_state = state;
        // The second argument was omitted, so we should change to the state
        // given as the first argument, provided that the state mentioned exists.
        if(this.current_state !== null) this.states[this.current_state].onleave(new_state);
        this.current_state = state;
        this.states[this.current_state].onenter(old_state);
        
        return this;
      }
      else {
        // And if it doesn't exist, throw an exception.
        throw(
          "Using Game.state() with only a string argument for a state that does" +
          "not exist is ambiguous. If you meant to create a new empty state," +
          "use `mygame.state('name of state', {})."
        );
      }
    }
  }
  else if(typeof(state) === 'undefined') {
    // No arguments given. Just return the current state.
    return this.current_state;
  }
};
/*
 * Game.run()
 * 
 * Starts the main game loop, which never stops.
 */
Game.prototype.run = function () {
  var thegame = this;
  window.vg_timer = window.setInterval(function () {
    thegame.states[thegame.state()].onloop();
  }, 1000.0 / 24.0);
};

/******************************************************************************
 * Sprite                                                                     *
 ******************************************************************************
   Sprites are the main graphical class of this framework. This main super-
   class of all sprites and sprite-like things is the interface that Game uses
   to wrangle all the sprites and graphics, and contains most of the methods
   for dealing with them.
 *****************************************************************************/
var Sprite = function (options) {
  $.extend(this, {
    radius           : 20,
    position         : {x: 0, y: 0},
    velocity         : {x: 0, y: 0},
    angle            : 0,
    angular_velocity : 0,
    before_move      : function () { return true; },    // These can be set by 
    after_move       : function () { return true; }     // the caller.
  }, options);
};
Sprite.prototype.reposition = function (x, y) {
  this.position.x = x;
  this.position.y = y;
  return this;
};
Sprite.prototype.move = function () {
  if(this.before_move()) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.angle += this.angular_velocity;
    this.after_move();
  }
  return this;
};
Sprite.prototype.redraw = function (ctx) {
  return this;
};
Sprite.prototype.collides_with = function (sprite) {
  dx = Math.abs(sprite.position.x - this.position.x);
  dy = Math.abs(sprite.position.y - this.position.y);

  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) < this.radius + sprite.radius;
};

/******************************************************************************
 * ImageSprite                                                                *
 ******************************************************************************
   ImageSprites redraw themselves using static images.
 *****************************************************************************/
var ImageSprite = function (url, options) {
  this.image = new Image();
  this.image.src = url;
  $.extend(this, {
    radius           : (this.image.width + this.image.height) / 4.0,
    position         : {x: 0, y: 0},
    velocity         : {x: 0, y: 0},
    angle            : 0,
    angular_velocity : 0,
    before_move      : function () { return true; },    // These can be set by 
    after_move       : function () { return true; }     // the caller.
  }, options);
  console.log("ImageSprite initialized with position: " + this.position.x + ", " + this.position.y);
};
ImageSprite.prototype = new Sprite();
ImageSprite.prototype.redraw = function (ctx) {
  with(ctx) {
    strokeStyle = "rgb(255,255,255)";
    save();
    translate(this.position.x, this.position.y);
    rotate(this.angle);
    
    drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
    
    restore();
  };
};

/******************************************************************************
 * VectorSprite                                                               *
 ******************************************************************************
   VectorSprite redraw themselves using lists of polyline points.
 *****************************************************************************/
var VectorSprite = function (options) {
  $.extend(this, options, {
    position         : {x: 0, y: 0},
    velocity         : {x: 0, y: 0},
    angle            : 0,
    angular_velocity : 0,
    before_move      : function () { return true; },    // These can be set by 
    after_move       : function () { return true; }     // the caller.
  });
  this.polylines = {};
};
VectorSprite.prototype = new Sprite();
VectorSprite.prototype.redraw = function (ctx) {
  with(ctx) {

  };
};
