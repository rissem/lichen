Meteor.startup(function(){
  $(window).keydown(function(event){
    for (var i = 0; i < HAND_KEYS.length; i++) {
      if (HAND_KEYS[i] == String.fromCharCode(event.keyCode)) {
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
  
  image: function(){
    return IMAGES[this.type];
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
    return this.index == Players.findOne(Session.get("currentPlayer")).selectedPiece ? "selectedPiece" : "";
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
  
  imageCoordinates: function(){
    return this.imageCoordinates();
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
  players: function(){
    return Players.find({}, {sort: {"points": -1}});
  },

  playerColor: function() {
    return COLORS[this.color].energy;
  },
  
  playerName: function() {
    return this.name;
  },
  
  playerPoints: function(){
    return Math.floor(this.points/100);
  },
  
  playerSelected: function(){
    return this._id === Session.get("currentPlayer") ? "playerSelected" : "";
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
    Session.set("currentPlayer", this._id);
  },
  "click .handIcon": function(){
      Players.update(Session.get("currentPlayer"), {$set: {"selectedPiece": this.index}});
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

  "click image": function(){
    if (GAME_OVER) {
        return;
    }
    
    var player = Players.findOne(Session.get("currentPlayer"));
    var handPiece = HandPieces.findOne({playerId: player._id, index: player.selectedPiece});
    
    // Don't allow empty pieces to be placed
    if (handPiece.type == "empty")
      return;
      
    // Don't allow pieces to be placed on the exact same type
    if (this.playerId == player._id && this.type == handPiece.type)
      return;
      
    // Make sure new piece is powerful enough to take old piece
    if (this.type != "empty" && this.playerId != player._id) {
      var newPiece = PIECES[handPiece.type];
      var oldPiece = PIECES[this.type];
      if (oldPiece.defense >= newPiece.attack) {
        return;
      }
    }
    
    // Add the piece
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
