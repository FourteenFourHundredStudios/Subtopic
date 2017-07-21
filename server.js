

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
var formidable = require('formidable');
bodyParser = require('body-parser');
var multer = require('multer');

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())


mongoUtil = require('./DBConnection');
mongoUtil.connectToServer( function( err ) { 
     console.log("connected to DB!");    
     dbm = require('./DBManager');
     
});




app.use('/images', express.static('Images'))
app.use('/static', express.static('Static'))

app.get('/', function (req, res) {

    res.render(path.join(__dirname, 'WebContent/home.ejs'),{query : req.query});
});




app.post('/postImage', function (req, res) {

            //complex algoritham for nameing Images
            imgName=sha1(Math.random());
            var Storage = multer.diskStorage({
                destination: function(req, file, callback) {
                    callback(null, "./Images");
                },
                filename: function(req, file, callback) {
                    //everything is a png now; whatever; its fine; ill fix it later
                    callback(null, imgName+".png");
                }
            });

            var upload = multer({
                storage: Storage
            }).array("fileHolder", 3); 

            upload(req, res, function(err) {
                dbm.getOne({session:req.body.session},"users",function(user){
                    if(user){
                        if (err) {
                            return res.end("Something went wrong!");
                        }
                        query={
                            username:user.username,
                            type:"image",
                            topic:req.body.topic,
                            body:imgName,
                            id:imgName,
                            linked:req.body.supertopic,
                            date:new Date()
                        };

                        dbm.insert(query,"subtopics",function(result){
                            res.send({status:"ok",message:result.ops[0].id});
                        });
                    }else{
                        //do something to delete file if session is invalid because JS is awful
                        res.end("invalid session");
                    }
                });
            });


});


//use this for loading arbitrary ejs files to front end where u need to be logged in to use
app.post('/load', function (req, res) {
    dbm.getOne({session:req.body.id},"users",function(user){
        if(user){
            file = fs.readFileSync(__dirname + '/WebContent/'+req.body.page+'.ejs', 'UTF-8'),
            rendered = ejs.render(file, req.body);
            res.send(rendered);
        }else{
            res.send("Invalid Session ID");
        }
    });
});

//notes to Marc:
//do some cool function callback stuff with like 'specail subtopics like 'supertopic' and 'hottopic(lol)' '
//aslo make more efficent,because it is poorly written
//and start using async library


app.post('/subtopic', function (req, res) {
    //req.body.topic is the ID of post, that is not clear
    dbm.get({linked:req.body.topic},"subtopics",function(data){
        dbm.getOne({id:req.body.topic},"subtopics",function(supertopic){
           
                if(req.body.topic=="supertopic"){
                    file = fs.readFileSync(__dirname + '/WebContent/subtopic.ejs', 'UTF-8'),
                    rendered = ejs.render(file, {supertopic:{topic:"Supertopic"},que:[],topics:data});
                    res.send(rendered);
                }else{
                    if(supertopic){
                        getLinkQue(req.body.topic,function(que){
                            file = fs.readFileSync(__dirname + '/WebContent/subtopic.ejs', 'UTF-8'),
                            rendered = ejs.render(file, {que:que,supertopic:supertopic,topics:data});
                            res.send(rendered);
                        });              
                    }else{
                        res.send("this subtopic does not exist :(")
                    }
                }
        });
    });
});


//eventually change the 'linked' field to supertopic? idk.
app.post('/post', function (req, res) {
    dbm.getOne({session:req.body.id},"users",function(user){
        if(user){
            query={
                username:user.username,
                type:"text",
                topic:req.body.topic,
                body:req.body.body,
                id:sha1(Math.random()),
                linked:req.body.supertopic,
                date:new Date()
            };
            dbm.insert(query,"subtopics",function(result){
                res.send({status:"ok",message:result.ops[0].id});
            });
        }else{
            res.send({status:"error",message:"Invalid session ID"});
        }
    });
});

//idk if recursively is the most efficent way, but it works


function getLinkQue(id,callback){
        que=[];


        nextLink(id);
        function nextLink(nextId){
 
            if(nextId=="supertopic"){
                val={id:"supertopic",topic:"Supertopic"}
                que.push(val);
                callback(que);
                return;
            }

            dbm.getOne({id:nextId},"subtopics",function(subtopic){
            
                val={id:subtopic.id,topic:subtopic.topic}
                if(subtopic.id!=id)que.push(val);
                nextLink(subtopic.linked);
            });
        }  
 
}

app.post('/login', function (req, res) {
    dbm.getOne({username:req.body.username,password:req.body.password},"users",function(result){
        if(result){
            key=sha1(Math.random());
            dbm.update({username:req.body.username,password:req.body.password},{session:key},"users",function(result){
                res.send({status:"ok",message:key})
            });
        }else{
            res.send({status:"error",message:"Invalid username or password"});
        }
    });
});

server.listen(8090,function(){
    console.log('SubTopic listening on port 8090!')

   
});

