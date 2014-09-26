Meteor.methods({
  updateCell: function(args){
    var cellId = args[0];
    var options = args[1];
    
    var options = _.extend(options, {
      birthTime: Date.now(),
      growTime: null
    });
    var count = Cells.update({_id: cellId}, {$set: options});
  }
});
