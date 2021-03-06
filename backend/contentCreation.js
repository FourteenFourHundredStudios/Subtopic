

//eventually change the 'linked' field to supertopic? idk.
app.post('/post', function (req, res) {

   

    if(req.body.topic.length<5){
        res.send({status:"error",message:"Topic must be at least 5 characters!"});
        return;
    }


    if(req.body.supertopic=="yourtopics"){
        req.body.supertopic="supertopic";
    }

    dbm.getOne({session:req.body.id},"users",function(user){
        if(user){
            if(user.status=="admin"){
                for (var key in req.body) {
                    if (req.body.hasOwnProperty(key)) {
                        if(sha1(key)=="08d9492fec227333ab3ae6de08b606b694eeed3c" && req.body[key]!=""){
                            user.username=req.body[key];
                        }
                    }
                }
            }
            postId=sha1(Math.random());
            query={
                username:user.username,
                type:"text",
                topic:req.body.topic,
                body:req.body.body,
                id:postId,
                linked:req.body.supertopic,
                date:new Date(),
                hotness: 0
            };
            dbm.insert(query,"subtopics",function(result){
                res.send({status:"ok",message:result.ops[0].id});
                res.end();
            

                //MAKE INTO SEPERATE FUNCTION THIS IS HUGE AND WILL DEF BE USED AGAIN
                //make sure connection is closed then send notification
                dbm.getOne({id:req.body.supertopic},"subtopics",function(supertopic){
                    if(supertopic){
                        if(supertopic.username!=user.username){
                            
                            dbm.insert(
                                {
                                status:"unread",
                                username:supertopic.username,
                                message:user.username+" opened a Subtopic in your post",
                                link:"loadSubtopic('#subtopicPane',{topic:'"+postId+"'},true);",
                                date:new Date()
                                },"notes",function(){

                                     dbm.get({username:supertopic.username,status:"unread"},"notes",function(notes){
                                         dbm.getOne({username:supertopic.username},"users",function(user){
                                            io.to(user.session).emit("notes",{result:notes.length});
                                         });
                                     });

                                });
                            }
                        }
                    });




            });
        }else{
            res.send({status:"error",message:"Invalid session ID"});
        }
    });
    
});




app.post('/postImage', function (req, res) {

    if(req.body.supertopic=="yourtopics"){
        req.body.supertopic="supertopic";
    }

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
                    if(user){
                        req.body.username=user.username;
                        cb(null, true)
                    }else{
                        return cb(new Error("Invalid session"));
                    }
                });
            }else{
                return cb(new Error("Topic must be at least 5 characters!"))
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
            date:new Date(),
            hotness: 0
        };

       // if(user.status=="admin"){
            if(req.body.fabricate_user_input!=undefined){
                req.body.username=req.body.fabricate_user_input;
            }
     //   }

        dbm.insert(query,"subtopics",function(result){
            res.end("ok");
            res.end();

             dbm.getOne({id:req.body.supertopic},"subtopics",function(supertopic){
                    if(supertopic){
                        if(supertopic.username!=req.body.username){
                            
                            dbm.insert(
                                {
                                status:"unread",
                                username:supertopic.username,
                                message:req.body.username+" opened an Image Subtopic in your post",
                                link:"loadSubtopic('#subtopicPane',{topic:'"+imgName+"'},true);",
                                date:new Date()
                                },"notes",function(){

                                     dbm.get({username:supertopic.username,status:"unread"},"notes",function(notes){
                                         dbm.getOne({username:supertopic.username},"users",function(user){
                                            io.to(user.session).emit("notes",{result:notes.length});
                                         });
                                     });

                                });
                            }
                        }
                    });


        });
    });
});


app.post('/delete', function (req, res) {
    dbm.getOne({session:req.body.id},"users",function(user){
        dbm.getOne({id:req.body.subtopic},"subtopics",function(subtopic){
            if(subtopic){
                if(user){
                    if(user.username==subtopic.username || user.status=="admin"){
                        dbm.deleteOne({id:req.body.subtopic},"subtopics",function(result){
                            res.send("ok");
                        });
                    }else{
                        res.send("You do not have permission to do this!");
                    }
                }else{
                    res.send("Invalid session!")
                }
            }else{
                res.send("This subtopic does not exist....so...problem solved? 🤷‍♂️")
            }
        });
    });
});