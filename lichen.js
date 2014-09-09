BOARD_WIDTH = 1000;
BOARD_HEIGHT = 1000;
BOARD_RADIUS = 7;
HEX_RADIUS = 20;

SQRT_3_2 = Math.sqrt(3)/2;

var origin = function(){
  return {
    x: BOARD_WIDTH / 2,
    y: BOARD_HEIGHT / 2
  };
};


Games = new Mongo.Collection("games");
Pieces = new Mongo.Collection("pieces");
Players = new Mongo.Collection("players");
Moves = new Mongo.Collection("moves");
Cells = new Mongo.Collection("cells", {transform: function(doc){
  var model = _.clone(doc);

  model.xCoord = function(){
    return origin().x + this.x * HEX_RADIUS * 3 / 2;
  };

  model.yCoord = function(){
    return origin().y - (this.y * HEX_RADIUS * 2 + this.x * HEX_RADIUS);
  };
  
  model.cellPoints = function() {
    var x = this.xCoord();
    var y = this.yCoord();
    var left_x = x - HEX_RADIUS;
    var right_x = x + HEX_RADIUS;
    var half_left_x = x - HEX_RADIUS / 2;
    var half_right_x = x + HEX_RADIUS / 2;
    var top_y = y - HEX_RADIUS * SQRT_3_2;
    var bottom_y = y + HEX_RADIUS * SQRT_3_2;
    
    return String(left_x) + "," + String(y) + " " +
      String(half_left_x) + "," + String(top_y) + " " +
      String(half_right_x) + "," + String(top_y) + " " +
      String(right_x) + "," + String(y) + " " +
      String(half_right_x) + "," + String(bottom_y) + " " +
      String(half_left_x) + "," + String(bottom_y);
  };

  return model;
}});

if (Meteor.isServer && Cells.find().count() == 0){
  console.log("No cells exist, creating cells");
  for (var i = -BOARD_RADIUS; i <= BOARD_RADIUS; i++){
    var min_j = -BOARD_RADIUS;
    var max_j = BOARD_RADIUS;
    if (i < 0) {
      min_j -= i;
    } else if (i > 0) {
      max_j -= i;
    }
    for (var j = min_j; j <= max_j ; j++){
      Cells.insert({
        _id: i + "," + j,
        x: i,
        y: j,
        type: "null"
      });
    }
  }
}
