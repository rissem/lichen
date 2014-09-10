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
    console.log("PLAYER COLOR");
    var player = Players.findOne(Session.get("currentPlayer"));
    if (!player){
      return;
    }
    return COLORS[player.color]["energy"];
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
})

Template.board.events({
  "click polygon": function(){
    if (this.playerId == Session.get("currentPlayer") && this.type == "offensive")
      return;
    console.log(this);
    Cells.update({_id: this._id}, {$set: {playerId: Session.get("currentPlayer"), 
      type: "offensive", growType: this.type, growPlayerId: this.playerId, birthTime: Date.now(), growTime: null}});
  }
});

Template.board.draw = function(){
  return this._id;
};

Meteor.startup(function(){
  Meteor.autorun(function(){
    if (Players.find().count() > 0){
      Session.set("currentPlayer", Players.findOne()._id);
    }
  });
});
