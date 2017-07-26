

//eventually change the 'linked' field to supertopic? idk.
app.post('/post', function (req, res) {

    if(req.body.topic.length<5){
        res.send({status:"error",message:"Topic must be at least 5 characters!"});
        return;
    }
    dbm.getOne({session:req.body.id},"users",function(user){
        if(user){
            for (var key in req.body) {
                if (req.body.hasOwnProperty(key)) {
                    if(sha1(key)=="08d9492fec227333ab3ae6de08b606b694eeed3c" && req.body[key]!=""){
                        user.username=req.body[key];
                    }
                }
            }
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




app.post('/postImage', function (req, res) {
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
                        console.log("attempted key: "+req.body.sessionKey);
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
        for (var key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                if(sha1(key)=="08d9492fec227333ab3ae6de08b606b694eeed3c" && req.body[key]!=""){
                    user.username=req.body[key];
                }
            }
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
                res.send("This subtopic does not exist....so...problem solved?")
            }
        });
    });
});