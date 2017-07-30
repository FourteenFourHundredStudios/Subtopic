
app.post('/login', function (req, res) {
    dbm.getOne({username:req.body.username,password:sha1(req.body.password)},"users",function(result){    
        if(result){
            if(result.status=="banned"){
                res.send({status:"error",message:"You've been banned from Subtopic!"});
                return;
            }
            if(result.status!="active" && result.status!="admin"){
                res.send({status:"error",message:"You need to activate your account!"});
                return;
            }
            key=sha1(Math.random());
            dbm.update({username:req.body.username,password:sha1(req.body.password)},{session:key},"users",function(result){
                res.send({status:"ok",message:key})
            });
        }else{
            res.send({status:"error",message:"Invalid username or password"});
        }
    });
});


function sendValidationEmail(key,email,callback){


    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'subtopic.co@gmail.com',
            pass: 'Phylum123'
        }
    });

    //urls="http://tinyspace.co";
    //if(debug){
        urls="http://subtopic.co";
    //}

    mailOptions = {
        from: 'Subtopic! 😉 <subtopic.co@gmail.com>', // sender address
        to: email, // list of receivers
        subject: 'Activate your Subtopic account!', // Subject line
        text: 'Click here to active your account ', // plain text body
        html: 'Click here to active your account <br><br> <a href="'+urls+'/v?c='+key+'">here</a>' // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            //console.log(error);
            callback(error);
            return;
        }else{
            callback();
        }
        //console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

app.post('/signup', function (req,res) {
    if(req.body.email.length<6){
        res.send({status:"error",message:"email too short!"});
        return;
    }
    if(req.body.username.length<2){
        res.send({status:"error",message:"username too short! (2 characters)"});
        return;
    }
    if(req.body.password.length<8){
        res.send({status:"error",message:"password too short! (8 characters)"});
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


        key=sha1(Math.random());

     
            dbm.insert({          
                "username" : req.body.username,
                "password" : sha1(req.body.password),
                "email" : req.body.email,
                "status" : key,
                "dateCreated" : new Date()
            },'users',(response,error)=>{
                if(error){
                    res.send({status:"error",message:"Username or email is taken!"});
                    return;
                }
                
                sendValidationEmail(key,req.body.email,function(error){
                    if(error){
                        dbm.db.collection("users").remove({"username" : req.body.username});
                        res.send({status:"error",message:"Please enter a valid email!"});
                        
                        return;
                    }

                    res.send({status:"ok"});
            });

        });


    });
});
