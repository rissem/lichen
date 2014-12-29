//do stuff
var stepSize = 50;
var lastRun = Date.now();

var tickStarted = null;
Meteor.startup(function(){
  Meteor.setInterval(function(){
    tickStarted = Date.now();
    
    if (GAME_OVER) {
        return;
    }
    
    // Update players (points, energy, etc) and determine if the game should end
    Players.find().forEach(function(player){
      var points = Cells.find({playerId: player._id}).count();
      Players.update(player._id, {$inc: {points: points}});
      if (player.points >= TARGET_POINTS) {
          GAME_OVER = true;
      }
    });

    if (GAME_OVER) {
        return;
    }
    
    // Create new board
    var timeSinceLastRun = Date.now() - lastRun;
    // console.log("time since last run", timeSinceLastRun);
    lastRun = Date.now();
    var newGameboard = [];
    for (var i = -BOARD_RADIUS; i <= BOARD_RADIUS; i++) {
      newGameboard[i] = [];
      for (var j = -BOARD_RADIUS; j <= BOARD_RADIUS; j++) {
        newGameboard[i][j] = null;
      }
    }
    
    // Grow cells
    Cells.find({}).forEach(function(cell){
      cell.grow(newGameboard);
    });
    
      // console.log("THE NEW GAMEBOARD!!!!!!!!!!", newGameboard);
  
    // Update cells
    for (var i = -BOARD_RADIUS; i <= BOARD_RADIUS; i++) {
      for (var j = -BOARD_RADIUS; j <= BOARD_RADIUS; j++) {
        var cell = newGameboard[i][j];
        if (cell !== null) {
          // console.log("UPDATING CELL", cell);
          Cells.update(cell._id, cell);
        }
      }
    }
    
    // console.log("TICK COMPLETE IN ", Date.now() - tickStarted);
  }, stepSize);
});
