/*global foobar */
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
wildcardSubdomains = require('wildcard-subdomains')


app.use(bodyParser.urlencoded())
app.use(bodyParser.json())


mongoUtil = require('./DBConnection');
mongoUtil.connectToServer( function( err ) { 
     console.log("connected to DB!");    
     dbm = require('./DBManager');
     
});




app.get('/s/*/', function(req, res){
    url=req.originalUrl.substring(3);
   // console.log(url)
    res.render(path.join(__dirname, 'WebContent/home.ejs'),{query : req.query,domain:url});
})


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
                storage: Storage,
                fileFilter: function (req, file, cb) {
                    if(req.body.topic.length>=5){
                        dbm.getOne({session:req.body.sessionKey},"users",function(user){
                            //console.log("checking user "+req.body.sessionKey);
                            if(user){
                                
                                req.body.username=user.username;
                                cb(null, true)
                            }else{
                                console.log("attempted key: "+req.body.sessionKey);
                                return cb(new Error("Invalid session"));
                                //res.send({status:"error",message:"Invalid Session!"});
                                //res.end();
                            }
                        });
                    }else{
                        return cb(new Error("Topic must be at least 5 characters!"))

                        //res.send({status:"error",message:"Topic must be at least 5 characters!"});
                        //res.end();
                    }
                }   
            }).array("fileHolder", 1); 

            

            upload(req, res, function(err) {
                
                
                    
                if (err) {
                    return res.end(err.message);
                }

                query={
                    username:req.body.username,
                    type:"image",
                    topic:req.body.topic,
                    body:imgName,
                    id:imgName,
                    linked:req.body.supertopic,
                    date:new Date()
                };

                dbm.insert(query,"subtopics",function(result){
                    res.end("ok");
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

app.post('/loadSafe', function (req, res) {
            file = fs.readFileSync(__dirname + '/WebContent/safe/'+req.body.page+'.ejs', 'UTF-8'),
                rendered = ejs.render(file, req.body);
            res.send(rendered);




});


function getTopics(search,index,count,callback){
      //db.collection("customers").find().sort(mysort).toArray(function(err, result) {


    dbm.db.collection("subtopics").find(search).skip(index*count).limit(count).sort({date:-1}).toArray(function(err, result) {
       
        callback(result);
    });
}


//notes to Marc:
//do some cool function callback stuff with like 'specail subtopics like 'supertopic' and 'hottopic(lol)' '
//aslo make more efficent,because it is poorly written
//and start using async library

app.post('/subtopic', function (req, res) {
    //req.body.topic is the ID of post, that is not clear
  
    index=0;
    count=7;

    if(req.body.index!==undefined){
        index=parseInt(req.body.index);
    }

    /*
    I figured changing the count to a variable was too much so I set it to 7 by default
    if(req.body.count!==undefined){
        count=parseInt(req.body.count);
       // console.log(count);
    }*/

    getTopics({linked:req.body.topic},index,count,function(data){
        //console.log(req.body.clean!=undefined);
        if(req.body.clean!=undefined){
            //console.log(data);
            res.send(data);
            return;
        }
        dbm.getOne({id:req.body.topic},"subtopics",function(supertopic){
            if(req.body.topic=="supertopic"){
                file = fs.readFileSync(__dirname + '/WebContent/subtopic.ejs', 'UTF-8'),
                rendered = ejs.render(file, {supertopic:{topic:"Supertopic",id:"supertopic"},req:req,que:[],topics:data,page:index});
                res.send(rendered);
            }else{
                if(supertopic){
                    getLinkQue(req.body.topic,function(que){
                        file = fs.readFileSync(__dirname + '/WebContent/subtopic.ejs', 'UTF-8'),
                        rendered = ejs.render(file, {que:que,page:index,req:req,supertopic:supertopic,topics:data});
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

    //console.log(req.body.topic.length);

    
    if(req.body.topic.length<5){
        res.send({status:"error",message:"Topic must be at least 5 characters!"});
        return;
    }
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

app.post('/signup', function (req,res) {
    dbm.insert({
        "email" : req.body.email,
        "username" : req.body.username,
        "password" : req.body.password
    },'users',()=>{
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
    })
});

server.listen(8090,function(){
    console.log('SubTopic listening on port 8090!')

   
});

