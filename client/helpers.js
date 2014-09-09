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
  
  xCoord: function(){
    return this.xCoord();
  },

  yCoord: function(){
    return this.yCoord();
  }
});

Template.board.events({
  "click polygon": function(){
    console.log(this);
  }
});

Template.board.draw = function(){
  return this._id;
}
