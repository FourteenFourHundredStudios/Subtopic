var MongoClient = require( 'mongodb' ).MongoClient;

var _db;

module.exports = {

  connectToServer: function( callback ) {
    MongoClient.connect( dbURL,{server: {poolSize: 1}}, function( err, db ) {
      
      //db.authenticate('Subtopic', 'Phylum123', function(err, res) {

        _db = db;
        return callback( err );
    //  });
    
    });
  },

  getDb: function() {
    return _db;
  }
};