


loadSubtopic("#subtopicPane",{topic:topic},true);
loadSubtopic("#suggestionPane",{topic:"supertopic"});



if(getCookie("session").length!=0){
    $.post("/load",{id:getCookie("session"),page:"openSubtopic"},function(div){       
        $("#loginForm").fadeOut("fast",function(){
            $("#loginForm").replaceWith(div);
            $('#subtopicForm').fadeIn("fast");
        });
    });
}else{
    $.post("/loadSafe",{page:"Login"},function(div){
        $("#loginForm").fadeOut("fast",function(){
            $("#loginForm").replaceWith(div);
            $('#loginForm').fadeIn("fast");
        });
    });

}



function loadSubtopic(id,topic,active){
    if(active){
        console.log(topic);
        //document.title = 'Subtopic: '+topic.topic;
        activeSubtopic=topic.topic;
        
        window.history.pushState("object or string", "test2", "/s/"+topic.topic);
    }
    $.post("/subtopic",topic,function(div){
        $(id).fadeOut("fast",function(){
            $(id).html(div);
            $(id).fadeIn("fast");
        });
    });
}



function logout(){
    deleteCookie("session");
    location.reload();
}

function showMore(topic,id,page){
    $.post("/subtopic",{topic:topic,index:page+1,nobody:true},function(content){
        $("#nextContent"+id).replaceWith(content);
    });
}