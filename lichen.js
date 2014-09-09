Games = new Mongo.Collection("games");
Pieces = new Mongo.Collection("pieces");
Players = new Mongo.Collection("players");
Moves = new Mongo.Collection("moves");
Cells = new Mongo.Collection("cells");

if (Meteor.isServer && Cells.find().count() == 0){
  console.log("No cells exist, creating cells");
  for (var i = -7; i < 7; i++){
    for (var j = -7; j < 7 ; j++){
      Cells.insert({
        _id: i + "," + j,
        type: "null"
      });
    }
  }
}


