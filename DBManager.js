db = mongoUtil.getDb();
db.collection("users").ensureIndex( { username: 1 }, { unique: true } );
db.collection("users").ensureIndex( { email: 1 }, { unique: true } );

db.collection("codes").insertOne({code:"marcsfriend",users:0},()=>{});
db.collection("codes").insertOne({code:"adamsfriend",users:0},()=>{});
db.collection("codes").insertOne({code:"foundonfacebook",users:0},()=>{});
db.collection("codes").insertOne({code:"foundonredddit",users:0},()=>{});
db.collection("codes").insertOne({code:"foundonyoutube",users:0},()=>{});

db.collection("codes").ensureIndex( { code: 1 }, { unique: true } );

exports.db=db;

 exports.insert=function(value,doc,cb){
     // MongoClient.connect(url, function(err, db) {

     db.collection(doc).insertOne(value, function (er, result) {
         cb(result,er);
         // db.close();
     });

     //});
 };


exports.deleteOne=function(search,dbDocument,callback){
    try{
       // MongoClient.connect(url, function(err, db) {
            db.collection(dbDocument).removeOne(search,function(err, doc) {
                callback(doc,err);
                //db.close();
            });
        //});
    }catch(err){
        console.error(err);
        callback(undefined,err);
    }
};

 exports.getOne=function(search,dbDocument,callback){
    try{
       // MongoClient.connect(url, function(err, db) {
            db.collection(dbDocument).findOne(search,function(err, doc) {
                callback(doc,err);
                //db.close();
            });
        //});
    }catch(err){
        console.error(err);
        callback(undefined,err);
    }
};

 exports.get=function(search,dbDocument,callback){
   // MongoClient.connect(url, function(err, db) {
        db.collection(dbDocument).find(search).toArray(function(err, doc) {
            callback(doc,err);
        });
};

exports.update=function(search,value,dbDocument,callback){
    db.collection(dbDocument).updateMany(search, { $set:value} , function(err, result) {
        callback(result,err);
    });
}

//db.getCollection('spaces').aggregate([{$match : {catagory:"general"}},{ $sample: { size: 1 } }])


 exports.getRand=function(search,dbDocument,count,callback) {

   // MongoClient.connect(url, function(err, db) {
        
        db.collection(dbDocument).aggregate([{$match : search},{ $sample: { size: count } }],function(err, doc){
            
             callback(doc,err);
            // db.close();
        });
     
};