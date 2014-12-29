BOARD_WIDTH = 750;
BOARD_HEIGHT = 820;
BOARD_RADIUS = 7;
HEX_RADIUS = 27;
DEAL_TIME = 5000;
TARGET_POINTS = 250000;
GAME_OVER = false;

HAND_KEYS = [
  "Q",
  "W",
  "E",
  "R",
  "T",
  "Y"
];

//square root of 3 divided by two
SQRT_3_2 = Math.sqrt(3) * 0.5;

//TODO should this really be a function?
var origin = function(){
  return {
    x: BOARD_WIDTH / 2,
    y: BOARD_HEIGHT / 2
  };
};

//TODO eliminate this once multiple games are supported
//GLOBAL
resetGame = function(){
    Cells.remove({});
    Players.remove({});
    HandPieces.remove({});
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
    if (Players.find().count() === 0){
      //Player 1
      Players.insert({
        name: "Mike",
        color: "green",
        "energy":0,
        "points":0,
        "selectedPiece":0
      });

      //Player 2
      Players.insert({
        name: "Teale",
        color: "blue",
        "energy":0,
        "points":0,
        "selectedPiece":0
      });

      // Player 3
      Players.insert({
        name: "Trevor",
        color: "orange",
        energy: 0,
        points: 0,
        selectedPiece: 0
      });

      // Hands
      Players.find().forEach(function(player) {
        for (var i = 0; i < HAND_KEYS.length; i++) {
          HandPieces.insert({
            index: i,
            key: HAND_KEYS[i],
            type: "empty",
            playerId: player._id,
            dealtTime: Date.now()
          });
        }
      });
    }
};

Games = new Mongo.Collection("games");
Pieces = new Mongo.Collection("pieces");
Players = new Mongo.Collection("players");
Moves = new Mongo.Collection("moves");
HandPieces = new Mongo.Collection("handPieces");
var transform = function(doc){
  var model = _.clone(doc);

  model.screenX = function(){
    return origin().x + this.x * (HEX_RADIUS * 3 / 2 + 1);
  };

  model.screenY = function(){
    return origin().y - (this.y * HEX_RADIUS * 2 + this.x * HEX_RADIUS);
  };

  //returns a string of coordinates that can be used by the polygon tag
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

  model.imageUrl = function(){
    return IMAGES[this.type];
  };

  model.imageCoordinates = function(){
    return {
      x: this.screenX() - HEX_RADIUS,
      y: this.screenY() - HEX_RADIUS
    };
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
  //yes, but what's to stop a client from cheating then?
  model.grow = function(gameBoard){
    if (this.type == "empty"){
      return;
    } else if (this.type == "offensive" || this.type == "energy" || this.type == "defense"){
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

  Meteor.publish("handPieces", function(playerId){
    // console.log("PLAYER ID", playerId);
    // console.log("COUNT", HandPieces.find({playerId: playerId}).count());
    return HandPieces.find({playerId: playerId});
  });

  Meteor.publish("cells", function(){
    // console.log("PUBLISH THE CELLS", Cells.find().count());
    return Cells.find({});
  });
}

if (Meteor.isClient){
  Meteor.subscribe("games");
  Meteor.subscribe("players");
  Meteor.subscribe("moves");
  Meteor.subscribe("cells");
  Meteor.autorun(function(){
    Meteor.subscribe("handPieces", Session.get("currentPlayer"));
  });
}

//this seems like it should be stored in the model for each of the cell types
COLORS = {
  green: {
    walls: "#84BF82",
    energy: "#84BF82",
    offensive: "#84BF82",
    defense: "#84BF82"
  },
  orange: {
    walls: "#7BB779",
    energy: "#ff9142",
    offensive: "#ff874e",
    defense: "#ff4e1c"
  },
  blue: {
    walls: "#4C85D8",
    energy: "#4C85D8",
    offensive: "#4C85D8",
    defense: "#4C85D8"
  }
};

GROWING_COLORS = {
  green: {
    walls: "#B6E5B5",
    energy: "#B6E5B5",
    offensive: "#B6E5B5",
    defense: "#B6E5B5"
  },
  orange: {
    walls: "#B6E5B5",
    energy: "#ff9142",
    offensive: "#ff874e",
    defense: "#ff4e1c"
  },
  blue: {
    walls: "#A3C0EF",
    energy: "#A3C0EF",
    offensive: "#A3C0EF",
    defense: "#A3C0EF"
  }
};

IMAGES = {
  walls: "crown.png",
  energy: "farmer.png",
  offensive: "sword.png",
  defense: "shield.png"
};

PIECES = {
  "offensive": {
    "attack": 5,
    "defense": 2,
    "growthRate": 800,
  },
  "energy": {
    "attack": 3,
    "defense": 1,
    "growthRate": 500,
  },
  "defense": {
    "attack": 1,
    "defense": 3,
    "growthRate": 1200,
  }
};

KEY_PIECE_MAP = {
  "Q": "offensive",
  "W": "energy"
};

//this should be refactored into a start game function
Meteor.startup(function(){
  if (Meteor.isServer && Cells.find().count() === 0){
    resetGame();

    Meteor.setInterval(function(){
      if (GAME_OVER) {
        return;
      }

      Players.find().forEach(function(player) {
        var lastDealtPiece = HandPieces.findOne({playerId: player._id}, {sort: {dealtTime: -1}});
        var lastDealtTime = lastDealtPiece.dealtTime;
        var emptyHandPieces = HandPieces.find({playerId: player._id, type:"empty"}, {sort: {index: 1}});
        if (Date.now() - lastDealtTime > DEAL_TIME && emptyHandPieces.count()) {
          console.log(Date.now() - lastDealtTime, DEAL_TIME);
          var piece_bucket = Math.random();
          var newType = "offensive";
          if (piece_bucket <= 0.33) {
            newType = "defense";
          } else if (Math.random() <= 0.66) {
            newType = "energy";
          }
          HandPieces.update(emptyHandPieces.fetch()[0]._id, {$set: {type: newType, dealtTime: Date.now()}});
        }
      });
    }, 500);
  }
});

var growthFunctions = {
  "empty": function() {},

  "offensive": function() {
  },

  "energy": function() {
  },

  "defense": function() {
  },
};
