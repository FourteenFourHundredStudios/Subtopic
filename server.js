
express = require('express');
http = require('http');
app = express();
server = http.createServer(app);
fs = require('fs');
path = require('path');
ejs = require('ejs');
sha1 = require('sha1');
'use strict';
const util = require('util');
bodyParser = require('body-parser');
multer = require('multer');
async = require('async');
nodemailer = require("nodemailer");

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())


mongoUtil = require('./DBConnection');
mongoUtil.connectToServer( function( err ) { 
     console.log("connected to DB!");    
     dbm = require('./DBManager');
});

require('./contentCreation.js');
require('./SubtopicManager.js');
require('./UserManager.js');



app.get('/s/*/', function(req, res){
    url=req.originalUrl.substring(3);
    if(url=="")url="supertopic";
    res.render(path.join(__dirname, 'WebContent/home.ejs'),{query : req.query,domain:url});
})


app.use('/images', express.static('Images'));
app.use('/static', express.static('Static'));


app.get('/', function (req, res) {
    res.render(path.join(__dirname, 'WebContent/home.ejs'),{query : req.query});
});

app.get('/v', function (req, res) {
     dbm.getOne({status:req.query.c},"users",function(user){
         if(user){
            dbm.update({status:req.query.c},{status:"active"},"users",function(result){
                res.writeHead(302, {
                    'Location': '/?q=v'
                });
                res.end();
            });
         }else{
             res.send("This link has expired or does not exist!");
         }
     });
});


app.post('/load', function (req, res) {
    dbm.getOne({session:req.body.id},"users",function(user){
        if(user){
            file = fs.readFileSync(__dirname + '/WebContent/'+req.body.page+'.ejs', 'UTF-8');
            rendered = ejs.render(file, {req:req,user:user});
            res.send(rendered);
        }else{
            res.send("Invalid Session ID");
        }
    });
});

app.post('/loadSafe', function (req, res) {

    file = fs.readFileSync(__dirname + '/WebContent/safe/'+req.body.page+'.ejs', 'UTF-8');
    rendered = ejs.render(file, req.body);
    res.send(rendered);
});


//ubuntu@ec2-
server.listen(8090,'localhost',function(){
    console.log('SubTopic listening on port 8090!')
});

