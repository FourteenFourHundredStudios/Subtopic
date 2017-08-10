/*
massEmail('firstMassEmail','this is some content in the message',()=>{
    console.log('mass email sent')
})
*/

function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}



app.get('/admin', function(req, res){
    dbm.db.collection("users").findOne({session:parseCookies(req)["session"]},function(error,user){
        if(user.status=="admin"){
            res.sendfile('./Admin/adminTools.html')
        }else{
            res.send("Fuck you");
        }
    });


});

app.post('/sendMassEmail', function (req, res) {
    dbm.db.collection("users").findOne({session:parseCookies(req)["session"]},function(error,user){
        if(user.status=="admin"){
            massEmail(req.body.subject,req.body.message,()=>{
                res.send('emails sent');
            })
        }else{
            res.send("Fuck you");
        }
    });

});

function massEmail(subject,content,callback){
    dbm.db.collection('users').find({}).toArray(function(err, doc) {
        for(var i =0; i<doc.length;i++) {
            sendEmail(doc[i].email,subject,content)
        }
        callback(doc,err);
    });
}


function sendEmail(email,subject,content){

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });

    urls="https://subtopic.co";
    if(debug){
        urls="http://localhost:8000";
    }

    mailOptions = {
        from: 'Subtopic! 😉 <subtopic.co@gmail.com>', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: content // plain text body
        /// html: 'Click here to active your account <br><br> <a href="'+urls+'/v?c='+key+'">here</a>' // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            //console.log(error);
            //callback(error);
            return;
        }else{
            //callback();
        }
        //console.log('Message %s sent: %s', info.messageId, info.response);
    });
}