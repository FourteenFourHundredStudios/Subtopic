var schedule = require('node-schedule');
var j = schedule.scheduleJob('* 1 * * *', function(){
    lowerhotness()
    removeUnvalidatedAccounts()
});
function lowerhotness(){
    console.log('The answer to life, the universe, and everything!');
    console.log(Date())
    let d = new Date()
    d.setDate(d.getDate()-2)//this gets everything created more than 2 days ago
    dbm.db.collection("subtopics").update({"date" : { $lt : d }},{ $mul: { hotness: .75} })// THIS WORKS
    /* this does not work, it was a attempt at truncation
    dbm.db.collection("subtopics").aggregate([
        { $match: { "date" : { $lt : d } } },
        { $mul: { hotness: .75} }
    ])
    //*/
}
//lowerhotness()

function removeUnvalidatedAccounts(){
    let d = new Date()
    d.setDate(d.getDate()-2)//this gets everything created more than 2 days ago
    dbm.db.collection('users').remove( {"dateCreated" : { $lt : d }},{ status: { $nin: ["active", "admin"] } } )
    console.log('removing all old accounts')
}