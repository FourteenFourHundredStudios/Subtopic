
app.post('/login', function (req, res) {
    dbm.getOne({username:req.body.username,password:sha1(req.body.password)},"users",function(result){
        if(result){
            key=sha1(Math.random());
            dbm.update({username:req.body.username,password:sha1(req.body.password)},{session:key},"users",function(result){
                res.send({status:"ok",message:key})
            });
        }else{
            res.send({status:"error",message:"Invalid username or password"});
        }
    });
});



app.post('/signup', function (req,res) {
    if(req.body.email.length<5){
        res.send({status:"error",message:"Email too short!"});
        return;
    }
    if(req.body.username.length<5){
        res.send({status:"error",message:"username too short!"});
        return;
    }
    if(req.body.password.length<5){
        res.send({status:"error",message:"password too short!"});
        return;
    }
    if(req.body.password!=req.body.passwordVal){
        res.send({status:"error",message:"passwords do not match!"});
        return;
    }
    dbm.db.collection("codes").update({ code: req.body.code },{ $inc: { users: 1 } },function(error,result){
        if(parseInt(result.result.nModified)==0){   
            res.send({status:"error",message:"Invalid signup code!"});
            return;
        }
        dbm.insert({
            "email" : req.body.email,
            "username" : req.body.username,
            "password" : sha1(req.body.password)
        },'users',(response,error)=>{
            if(error){
                res.send({status:"error",message:"Username or email is taken!"});
                return;
            }
            dbm.getOne({username:req.body.username},"users",function(result,error){
                if(result){
                    key=sha1(Math.random());
                    dbm.update({username:req.body.username,password:sha1(req.body.password)},{session:key},"users",function(result){
                        res.send({status:"ok",message:key})
                    });
                }else{
                    res.send({status:"error",message:"There was a problem logging you in!"});
                }
            });
        })
    });
});
