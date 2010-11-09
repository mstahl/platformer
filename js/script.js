/* Author: 

*/

$(function () {
  var tiles = [],
      width = $("#screen").width(),
      height = $("#screen").height(),
      mouse_down = false,
      context = document.getElementById('screen').getContext('2d');
  
  var redraw_tiles = function () {
    with(context) {
      fillStyle = 'rgb(0,0,0)';
      fillRect(0,0,width,height);
      
      fillStyle = 'rgb(255,255,255)';
      for(var x = 0; x < width / 10; ++x) {
        for(var y = 0; y < height / 10; ++y) {
          if(tiles[x][y]) {
            fillRect(x * 10, y * 10, 10, 10);
          }
        }
      }
    };
  };
  
  for(var x = 0; x < width / 10; x++) {
    tiles[x] = [];
    for(var y = 0; y < height / 10; y++) {
      tiles[x][y] = 0;
    }
  }
  $("#screen")
  .bind('mousedown', function (e) {
    var x = Math.floor((e.layerX - e.target.offsetLeft) / 10),
        y = Math.floor((e.layerY - e.target.offsetTop) / 10);
    
    tiles[x][y] = !e.metaKey;
    
    redraw_tiles();
    mouse_down = true;
    metakey_down = e.metaKey;
    return false;
  })
  .bind('mouseleave mouseup', function (e) {
    mouse_down = false;
    metakey_down = false;
  })
  .bind('mousemove', function (e) {
    if(mouse_down) {
      var x = Math.floor((e.layerX - e.target.offsetLeft) / 10),
          y = Math.floor((e.layerY - e.target.offsetTop) / 10);
      
      tiles[x][y] = !metakey_down;
      redraw_tiles();
      return false;
    }
  });
  $("#save").click(function (e) {
    $("#save-result")
    .text(JSON.stringify(tiles))
    .fadeIn('slow');
  });
});
