BOARD_WIDTH = 1000;
BOARD_HEIGHT = 1000;
BOARD_RADIUS = 7;
HEX_RADIUS = 27;

SQRT_3_2 = Math.sqrt(3) * 0.5;

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

var transform = function(doc){
  var model = _.clone(doc);

  model.screenX = function(){
    return origin().x + this.x * (HEX_RADIUS * 3 / 2 + 1);
  };

  model.screenY = function(){
    return origin().y - (this.y * HEX_RADIUS * 2 + this.x * HEX_RADIUS);
  };
  
  model.cellPoints = function() {
    var x = this.screenX();
    var y = this.screenY();
    var left_x = x - HEX_RADIUS;
    var right_x = x + HEX_RADIUS;
    var half_left_x = x - HEX_RADIUS / 2;
    var half_right_x = x + HEX_RADIUS / 2;
    var top_y = Math.ceil( y - HEX_RADIUS * SQRT_3_2 - 2);
    var bottom_y = Math.ceil(y + HEX_RADIUS * SQRT_3_2 + 2);
    
    var result = String(left_x) + "," + String(y) + " " +
      String(half_left_x) + "," + String(top_y) + " " +
      String(half_right_x) + "," + String(top_y) + " " +
      String(right_x) + "," + String(y) + " " +
      String(half_right_x) + "," + String(bottom_y) + " " +
      String(half_left_x) + "," + String(bottom_y);
    
    return result;
  };

  model.neighbors = function(){
    return Cells.find({_id: {$in: [(this.x+1)+","+this.y,
      (this.x-1)+","+this.y,
      this.x+","+(this.y+1),
      this.x+","+(this.y-1),
      (this.x-1)+","+(this.y+1),
      (this.x+1)+","+(this.y-1)
    ]}});
  };

  //should we be passing a timestamp here so all birth calculations use the same timestamp?
  model.grow = function(gameBoard){
    if (this.type == "empty"){
      return;
    } else if (this.type == "offensive"){
      if (this.growTime){
        return;
      }
      //console.log(this.birthTime);
      if (Date.now() - this.birthTime >= PIECES[this.type].growthRate){
        Cells.update({_id: this._id}, {$set: {growTime: Date.now()}});
        var _this = this;
        this.neighbors().forEach(function(neighbor){
          if (neighbor.type === _this.growType && neighbor.playerId === _this.growPlayerId){
            // console.log("ADD TO NEW GAMEBOARD");
            var newNeighbor = _.clone(_this);
            newNeighbor.growTime = null;
            newNeighbor.birthTime = Date.now();
            newNeighbor.x = neighbor.x;
            newNeighbor.y = neighbor.y;
            newNeighbor._id = neighbor.x + "," + neighbor.y;
            gameBoard[neighbor.x][neighbor.y] = newNeighbor;
          }
        });
      }
    }
  };
  return model;
}

if (Meteor.isServer){
  Cells = new Mongo.Collection("cells", {connection: null, transform: transform});
}

if (Meteor.isClient){
  Cells = new Mongo.Collection("cells", {transform: transform});
}


if (Meteor.isServer){
  Meteor.publish('games', function(){
    return Games.find({});
  });

  Meteor.publish('players', function(){
    return Players.find({});
  });

  Meteor.publish('moves', function(){
    return Moves.find({});
  });

  Meteor.publish("cells", function(){
    console.log("PUBLISH THE CELLS", Cells.find().count());
    return Cells.find({});
  })
} 

if (Meteor.isClient){
  Meteor.subscribe("games");
  Meteor.subscribe("players");
  Meteor.subscribe("moves");
  Meteor.subscribe("cells");
}

COLORS = {
  green: {
    walls: "#0f0",
    energy: "#090",
    offensive: "#030"
  },
  blue: {
    walls: "#00f",
    energy: "#009",
    offensive: "#003"
  }
};

GROWING_COLORS = {
  green: {
    walls: "#1e1",
    energy: "#1a1",
    offensive: "#141"
  },
  blue: {
    walls: "#11e",
    energy: "#11a",
    offensive: "#114"
  }
};

PIECES = {
  "offensive": {
    "growthRate": 1000,
  }
};

Meteor.startup(function(){
  if (Meteor.isServer && Cells.find().count() === 0){
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
          type: "empty"
        });
      }
    }
    
    //Player 1
    Players.insert({
      name: "Mike",
      color: "green",
      "energy":0,
      "points":5
    });
    
    //Player 2
    Players.insert({
      name: "Teale",
      color: "blue",
      "energy":0,
      "points":0
    });
  }
});

var growthFunctions = {
  "empty": function(){},
  
  "offensive": function(){
    
  }
};
