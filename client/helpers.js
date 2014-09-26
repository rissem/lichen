Meteor.startup(function(){
  $(window).keydown(function(event){
    if (!KEY_PIECE_MAP[String.fromCharCode(event.keyCode)])
      return;
    Players.update(Session.get("currentPlayer"), {$set: {"currentType": KEY_PIECE_MAP[String.fromCharCode(event.keyCode)]}});
  });
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
    return COLORS[player.color]["energy"];
  },
  
  currentType: function() {
    var player = Players.findOne(Session.get("currentPlayer"));
    if (!player) { return; }
    console.log("CURRENT TYPE: " + player.currentType);
    return player["currentType"];
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
  "click polygon": function(){
    var player = Players.findOne(Session.get("currentPlayer"));
    if (this.playerId == player._id && this.type == player.currentType)
      return;
    console.log(this);
    Cells.update({_id: this._id}, {$set: {playerId: player._id, 
      type: player.currentType, growType: this.type, growPlayerId: this.playerId, birthTime: Date.now(), growTime: null}});
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
