

globalTopics={

    supertopic:{
        getTopics:function(req,callback){
            getTopics({linked:"supertopic"},req.topic.index,req.topic.count,{date:-1},function(data){
                callback(data);
            });
        },
        supertopic:{
            id:"supertopic",
            topic:"Supertopic"
        }
    },


    hottopics:{
        getTopics:function(req,callback){
            getTopics({linked:"supertopic"},req.topic.index,req.topic.count,{},function(data){
                callback(data);
            });
        },
        supertopic:{
            id:"hottopics",
            topic:"Hot Topics 🔥"
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
    if(globalTopics[req.body.topic]==undefined){
        getTopics({linked:req.body.topic},req.topic.index,req.topic.count,{date:-1},function(data){
            callback(null,req,data);
        });
    }else{
        globalTopics[req.body.topic].getTopics(req,function(subtopics){
            callback(null,req,subtopics);
        });
        
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
        getLinkQue(req.body.topic,function(que){
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
}

app.post('/options', function (req, res) {
    dbm.getOne({session:req.body.id},"users",function(user){
        dbm.getOne({id:req.body.topicId},"subtopics",function(subtopic){
            file = fs.readFileSync(__dirname + '/WebContent/options.ejs', 'UTF-8'),
            rendered = ejs.render(file, {req:req,user:user,subtopic:subtopic});
            res.send(rendered);
        });
    });
});

app.post('/subtopic', function (req, res) {
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
});


function getTopics(search,index,count,sort,callback){
    dbm.db.collection("subtopics").find(search).skip(index*count).limit(count).sort(sort).toArray(function(err, result) {
        callback(result);
    });
}

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
