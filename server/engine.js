//do stuff
var stepSize = 50;

Meteor.setInterval(function(){
  var newGameboard = [];
  for (var i = -BOARD_RADIUS; i <= BOARD_RADIUS; i++) {
    newGameboard[i] = [];
    for (var j = -BOARD_RADIUS; j <= BOARD_RADIUS; j++) {
      newGameboard[i][j] = null;
    }
  }
  
  Cells.find({}).forEach(function(cell){
    cell.grow(newGameboard);
  });
  
    // console.log("THE NEW GAMEBOARD!!!!!!!!!!", newGameboard);

  for (var i = -BOARD_RADIUS; i <= BOARD_RADIUS; i++) {
    for (var j = -BOARD_RADIUS; j <= BOARD_RADIUS; j++) {
      var cell = newGameboard[i][j];
      if (cell !== null) {
        // console.log("UPDATING CELL", cell);
        Cells.update(cell._id, cell);
      }
    };
  }
}, stepSize);
