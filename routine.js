var schedule = require('node-schedule');
var j = schedule.scheduleJob('* * 12 * *', function(){
    lowerhotness()
});

function lowerhotness(){
    console.log('The answer to life, the universe, and everything!');
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
lowerhotness()