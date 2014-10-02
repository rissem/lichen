Meteor.startup(function(){
  $(window).keydown(function(event){
    for (var i = 0; i < HAND_KEYS.length; i++) {
      if (HAND_KEYS[i] == String.fromCharCode(event.keyCode)) {
        console.log("DO IT");
        Players.update(Session.get("currentPlayer"), {$set: {"selectedPiece": i}});
        break;
      }
    }
    /*
    if (!KEY_PIECE_MAP[String.fromCharCode(event.keyCode)])
      return;
    Session.set("currentPiece", )
    Players.update(Session.get("currentPlayer"), {$set: {"currentType": KEY_PIECE_MAP[String.fromCharCode(event.keyCode)]}});
    */
  });
});

Template.hand.helpers({
  handPieces: function() {
    return HandPieces.find({
      //playerId: Session.get("currentPlayer")
    }, {sort: {index: 1}});
  },
  
  empty: function() {
    return this.type == "empty";
  },
  
  key: function() {
    return this.key;
  },
  
  type: function() {
    return this.type;
  },
  
  color: function() {
    if (this.type == "empty") {
      return "aaa";
    } else {
      var player = Players.findOne(this.playerId);
      return COLORS[player.color][this.type];
    }
  },
  
  selected: function() {
    if (this.index == Players.findOne(Session.get("currentPlayer")).selectedPiece) {
      return "<--";
    } else {
      return "";
    }
  }
});

Template.board.helpers({
  boardWidth: function(){
    return BOARD_WIDTH;
  },

  boardHeight: function(){
    return BOARD_HEIGHT;
  },

  cells: function(){
    return Cells.find({});
  },
  
  cellPoints: function(){
    return this.cellPoints(); 
  },
  /*
  x: function(){
    return this.x;
  },

  y: function(){
    return this.y;
  },
  */
  color: function(){
    var player = Players.findOne(this.playerId);
    
    if (! player) {
      return "gray";
    } else {
      if (this.growTime !== null) {
        return COLORS[player.color][this.type];
      } else {
        return GROWING_COLORS[player.color][this.type];
      }
    }
  },
 
});

Template.body.helpers({
  playerColor: function() {
    var player = Players.findOne(Session.get("currentPlayer"));
    if (!player){
      return;
    }
    return COLORS[player.color].energy;
  },
  
  playerName: function() {
    var player = Players.findOne(Session.get("currentPlayer"));
    if (!player){
      return;
    }
    return player.name;
  },
  
  playerPoints: function(){
    var player = Players.findOne(Session.get("currentPlayer"));
    if (!player){
      return;
    }
    return player.points;
  },
  
  currentType: function() {
    var player = Players.findOne(Session.get("currentPlayer"));
    if (!player) { return; }
    console.log("CURRENT TYPE: " + player.currentType);
    return player.currentType;
  }
});

Template.body.events({
  "click h1": function(){
    var player = Players.findOne(Session.get("currentPlayer"));
    if (player.name == "Mike") {
      Session.set("currentPlayer", Players.findOne({name: "Teale"})._id);
    } else {
      Session.set("currentPlayer", Players.findOne({name: "Mike"})._id);
    }
  }
});

Template.board.events({
  "click a.reset": function(){
    console.log("RESET!");
    Meteor.call("reset", function(err, result){
      console.log("ERR", err);
      console.log("RESULT", result);
    });
    Meteor.setTimeout(function(){
      document.location.reload();
    }, 1000);
  },

  "click polygon": function(){
    var player = Players.findOne(Session.get("currentPlayer"));
    var handPiece = HandPieces.findOne({playerId: player._id, index: player.selectedPiece});
    if (handPiece.type == "empty")
      return;
    if (this.playerId == player._id && this.type == handPiece.type)
      return;
    Meteor.call("updateCell", [this._id, {
      playerId: player._id,
      type: handPiece.type,
      growType: this.type,
      growPlayerId: this.playerId}
    ]);
    HandPieces.update(handPiece._id, {$set: {type: "empty"}});
  }
});

Template.board.draw = function(){
  return this._id;
};

Meteor.startup(function(){
  var playersSet = false;
  Meteor.autorun(function(){
    if (playersSet)
      return;
    if (Players.find().count() > 0){
      playersSet = true;        
      Session.set("currentPlayer", Players.findOne()._id);
    }
  });
});
