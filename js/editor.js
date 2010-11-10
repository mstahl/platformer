/**
 * tileset-editor.js
 * 
 * Javascript for the tileset editor/viewer.
 */

$(function () {
  // Load the tileset from /js/tileset.js
  var tileset = [];
  var current_tile = null;
  
  var edit_tile = function (tile_id) {
    current_tile = tile_id;
    $("#tile-name").val(tileset[tile_id].name);
    $("#tile-metadata").show('slow');
  };
  
  $.getJSON('js/tileset.json', function (data, txtStatus, xhr) {
    // Once the file is loaded, create tiles in #tiles for each tile in the
    // tileset file.
    tileset = data;
    $("#tiles").empty();
    $.each(tileset, function (i, t) {
      $(document.createElement('div'))
      .attr('id', 'tile-' + i)
      .addClass('tile')
      .data('tile', t)
      .click(function (e) {
        console.log($(this).data('tile'));
        edit_tile($(this).data('tile').id);
      })
      .append(
        $(document.createElement('h4'))
        .text(t.name)
      )
      .css({
        'background-image': 'url(' + t.image + ')',
        'background-repeat': 'no-repeat',
        'background-position': '0px 0px'
      })
      .appendTo($("#tiles"));
    });
  });
});
