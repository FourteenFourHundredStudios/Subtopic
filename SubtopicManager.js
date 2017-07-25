
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
