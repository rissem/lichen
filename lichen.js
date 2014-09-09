Games = new Mongo.Collection("games");
Pieces = new Mongo.Collection("pieces");
Players = new Mongo.Collection("players");
Moves = new Mongo.Collection("moves");
Cells = new Mongo.Collection("cells");

if (Meteor.isServer && Cells.find().count() == 0){
  
}
