


require('../Settings.js');


express = require('express');
https = require('https');
http = require('http');
app = express();

fs = require('fs');

if(!debug){
    var options = {
        key: fs.readFileSync('/etc/letsencrypt/live/subtopic.co/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/subtopic.co/cert.pem'),
        "ca": fs.readFileSync("/etc/letsencrypt/live/subtopic.co/chain.pem")
    };
    server = https.createServer(options,app);
}else{
    server = http.createServer(app);
}

io = require('socket.io').listen(server);

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
mongoUtil.connectToServer( function( err ){
     console.log("connected to DB!");    
     dbm = require('./DBManager');
     require('./routine.js')
    //this lowers hotness, this should probably be in another place

});

require('./contentCreation.js');
require('./SubtopicManager.js');
require('./UserManager.js');
require('./Admin/routers.js')


app.get('/s/:url/:suburl?/', function(req, res){
    url=req.params["url"];
    if(url=="")url="supertopic";
    res.render(path.join(__dirname, 'WebContent/home.ejs'),{query : req.query,domain:url});
});


app.use('/images', express.static('../Images'));
app.use('/static', express.static('Static'));
app.use('/', express.static('Static'));

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

io.on('connection', function(socket){

    socket.on('join', function(pathname) {
        socket.join(pathname);
    });

    socket.on('noteGet', function(msg) {
        dbm.getOne({session:msg.id},"users",function(user){	
			if(user){
				dbm.get({username:user.username,status:"unread"},"notes",function(notes){
                    socket.emit("notes",{result:notes.length});
                });
			}else{
				socket.emit("issue",{result:"invalid session"});
			}
		});
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


if(!debug){
    server.listen(443,'172.31.13.38',function(){
        console.log('SubTopic started!')
    });


    var http = require('http');
    http.createServer(function (req, res) {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        res.end();
    }).listen(80);

    //fix later, just to stop server from crashing
    process.on('uncaughtException', function (err) {
        console.error(err);
    });
}else{
    server.listen(8000,'localhost',function(){
        console.log('SubTopic debug started!')
    });
}

