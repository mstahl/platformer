/**
 * editor.js
 * 
 * Javascript for the level editor/viewer.
 */

$(function () {
  var tileset = [],
      current_tile = null,
      level = [];
  
  $("#edit-metadata").dialog({
    autoOpen: false
  });
  
  $.getJSON('js/tileset.json', function (data, txtStatus, xhr) {
    // Once the file is loaded, create tiles in #tiles for each tile in the
    // tileset file.
    tileset = data;
    $("#tiles")
    .empty()
    .append(
      $(document.createElement('div'))
      .addClass('tile')
      .append(
        $(document.createElement('div'))
        .addClass('tile-name')
        .text('Air')
      )
      .click(function (e) {
        current_tile = null;
      })
    );
    $.each(tileset, function (i, t) {
      $(document.createElement('div'))
      .attr('id', 'tile-' + i)
      .addClass('tile')
      .data('tile', t)
      .click(function (e) {
        console.log($(this).data('tile'));
        current_tile = $(this).data('tile');
      })
      .append(
        $(document.createElement('div'))
        .addClass('tile-name')
        .text(t.name)
      )
      .css({
        'background-image': 'url(' + t.image + ')',
        'background-repeat': 'no-repeat',
        'background-position': '0px 0px'
      })
      .appendTo($("#tiles"));
    });
    
    $.getJSON('js/level.json', function (data) {
      level = data;
      redraw();
    });
  });
  
  // Initialize level here
  var clear_level = function () {
    for(var x = 0; x < 8; ++x) { 
      level[x] = [];
      for(var y = 0; y < 15; ++y) {
        level[x][y] = 0;
      }
    }
  };
  
  // Method for redrawing the screen
  var context = document.getElementById('screen').getContext('2d');
  var redraw = function () {
    with(context) {
      fillStyle = "rgb(0,0,0)";
      fillRect(0, 0, 800, 600);
      
      for(var x = 0; x < 8; ++x) {
        for(var y = 14; y >= 0; --y) {
          if(level[x][y] !== 0) {
            var img = new Image();
            img.src = tileset[level[x][y]-1].image;
            
            // To account for the way the tiles are drawn, translate before drawing.
            save();
            translate(0, -130);
            drawImage(img, x * 100, y * 40);
            restore();
          }
        }
      }
    };
  };
    
  // Event handlers for the editor screen.
  $("#screen")
  .bind('click', function (e) {
    // First capture the x/y coordinates of the click so as to be able to index
    // into the tiles[] array.
    var x = Math.floor((e.pageX - e.target.offsetLeft) / 100),
        y = Math.floor((e.pageY - e.target.offsetTop) / 40);
    if(current_tile !== null) {
      level[x][y] = current_tile.id;
    }
    else {
      level[x][y] = 0;
    }
    
    redraw();

    return false;
  });
  
  // and for the save button...
  $("#save")
  .click(function (e) {
    var uri = 'data:application/json,' + encodeURI(JSON.stringify(level));

    // window.location.href = uri;
    window.open(uri, 'level.json');
  });
  
  $("#clear").click(function (e) {
    clear_level();
    redraw();
  });
});
