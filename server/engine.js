//do stuff
var stepSize = 5000;

Meteor.setInterval(function(){
  Cells.find({}).forEach(function(cell){
    console.log("PERFORM CELL UPDATE", cell)
  });
}, stepSize);
