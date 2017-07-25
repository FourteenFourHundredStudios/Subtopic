

globalTopics={

    supertopic:{
        getTopics:function(req,callback){
            getTopics({linked:req.body.topic},req.topic.index,req.topic.count,function(data){
                callback(data);
            });
        },
        supertopic:{
            id:"supertopic",
            topic:"Supertopic"
        }
    }

}

function getSubtopics(req,callback){
    if(globalTopics[req.body.topic]==undefined){
        getTopics({linked:req.body.topic},req.topic.index,req.topic.count,function(data){
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

    getLinkQue(req.body.topic,function(que){
        callback(null,req,subtopics,supertopic,que);
    })
    
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


function getTopics(search,index,count,callback){
    dbm.db.collection("subtopics").find(search).skip(index*count).limit(count).sort({date:-1}).toArray(function(err, result) {
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
