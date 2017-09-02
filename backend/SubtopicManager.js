globalTopics={

    supertopic:{
        getTopics:function(req,callback){
            getTopics({linked:"supertopic"},req.topic.index,req.topic.count,{date:-1},function(data){
                callback(data);
            });
        },
        supertopic:{
            id:"supertopic",
            topic:"Master Supertopic"
        }
    },


    hottopics:{
        getTopics:function(req,callback){
            getTopics({},req.topic.index,req.topic.count,{hotness : -1},function(data){
                callback(data);
            });
        },
        supertopic:{
            id:"hottopics",
            topic:"Hot Topics 🔥"
        }
    },


    everything:{
        getTopics:function(req,callback){
            getTopics({},req.topic.index,req.topic.count,{date : -1},function(data){
                callback(data);
            });
        },
        supertopic:{
            id:"everything",
            topic:"This is everything we have. Literally."
        }
    },

     topic:{
        getTopics:function(req,callback){},
        supertopic:{
            id:"topic",
            topic:"Supertopic"
        }
    },

    yourtopics:{
        getTopics:function(req,callback){
            if(req.body.userId.length!=0){
                dbm.getOne({session:req.body.userId},"users",function(user){
                    getTopics({username:user.username},req.topic.index,req.topic.count,{date:-1},function(data){
                        callback(data);
                    });
                });
            }else{
                callback([]);
            }
        },
        supertopic:{
            id:"yourtopics",
            topic:"Your Subtopics 😎"
        }
    }

}

function getSubtopics(req,callback){
   if(req.params["param"]!=undefined){
        dbm.db.collection("subtopics").findOne({id:req.params["param"]},function(err, topic) {
            if(topic){
                a=[];
                a.push(topic);
                callback(null,req,a); 
            }else{
                callback(null,req,[]); 
            }        
        });
    }else if(globalTopics[req.body.topic]==undefined){
        query={linked:req.body.topic};
        if(req.body.subcomments!=undefined){
            query={
                linked:req.body.topic,
                topic:"<subcomment>"
            };
        }
        getTopics(query,req.topic.index,req.topic.count,{date:-1},function(data){
            callback(null,req,data);
        });
    }else if(globalTopics[req.body.topic]!=undefined){
        globalTopics[req.body.topic].getTopics(req,function(subtopics){
            callback(null,req,subtopics);
        });
        
    }else{
         callback(null,req,[]);
    }
}

function getSupertopic(req,subtopics,callback){
    if(globalTopics[req.body.topic]==undefined){
        dbm.getOne({id:req.body.topic},"subtopics",function(supertopic){
            callback(null,req,subtopics,supertopic);
        });
    }else{
        callback(null,req,subtopics,globalTopics[req.body.topic].supertopic);
    }
}

function getQue(req,subtopics,supertopic,callback){
    if(globalTopics[req.body.topic]==undefined){
        getLinkQue(req.body.topic,req,function(que){
            callback(null,req,subtopics,supertopic,que);
        })
    }else{
        callback(null,req,subtopics,supertopic,[]);
    }
    
}

function handleParams(req,callback){
    
    req.topic={};
    req.topic.index=0;
    req.topic.count=7;
    if(req.body.index!==undefined){
        req.topic.index=parseInt(req.body.index);
    }
    callback(null,req);
    dbm.db.collection("subtopics").update({id: req.body.topic },{ $inc: { hotness: 1} })
}

app.post('/options', function (req, res) {
    dbm.getOne({session:req.body.id},"users",function(user){
        dbm.getOne({id:req.body.topicId},"subtopics",function(subtopic){
            dbm.get({linked:req.body.topicId},"subtopics",function(subtopics){
                file = fs.readFileSync(__dirname + '/WebContent/options.ejs', 'UTF-8'),
                rendered = ejs.render(file, {req:req,user:user,subtopic:subtopic,count:subtopics.length});
                res.send(rendered);
            });
        });
    });
});

app.post('/subtopic/:param?', function (req, res) {
    //NOT EFFICENT, MARC


    dbm.getOne({id:req.body.topic},"subtopics",function(subtopic){
        if( subtopic || globalTopics[req.body.topic]!=undefined ){
            async.waterfall([
                async.apply(handleParams, req), 
                getSubtopics,
                getSupertopic,
                getQue
            ], function (err,req,subtopics,supertopic,que) {
                file = fs.readFileSync(__dirname + '/WebContent/subtopic.ejs', 'UTF-8'),
                rendered = ejs.render(file, {
                    que:que,
                    page:req.topic.index,
                    req:req,
                    supertopic:supertopic,
                    topics:subtopics
                });
                res.send(rendered);
            });
        }else{
            res.send("<h1>Error: We have no idea what just happend</h1><div class='card cardBody CardContainer cardContent' ><div style='padding:10px'>This Subtopic does not exist! 🤔😭</div></div>");
        }
    });
});



app.post('/api/subtopic/', function (req, res) {
    dbm.getOne({id:req.body.topic},"subtopics",function(subtopic){
        if( subtopic || globalTopics[req.body.topic]!=undefined ){
            async.waterfall([
                async.apply(handleParams, req), 
                getSubtopics,
                getSupertopic,
                getQue
            ], function (err,req,subtopics,supertopic,que) {
                info = {
                    que:que,
                    page:req.topic.index,
                    supertopic:supertopic,
                    topics:subtopics
                };
                res.send(info);
            });
        }else{
            res.send({error:"This Subtopic does not exist! 🤔😭"});
        }
    });
});



function getTopics(search,index,count,sort,callback){
    //{topic:{$ne:"<subcomment>"}}
    //q={ { $elemMatch: [search,{topic:{$ne:"<subcomment>"}}] };
   // search.topic={ $ne: "<subcomment>" };

 

    dbm.db.collection("subtopics").find(search).skip(index*count).limit(count).sort(sort).toArray(function(err, result) {
        callback(result);
    });
}


function getLinkQue(id,req,callback){
    que=[];
    nextLink(id);
    function nextLink(nextId){
        if(nextId=="supertopic"){
            val={id:req.body.orgin,topic:"Supertopic"}
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
