


loadSubtopic("#subtopicPane",{topic:topic},true);
loadSubtopic("#suggestionPane",{topic:"hottopics"},false);



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



function loadSubtopic(id,topic,active,e){
    if(e!=undefined){
        e.preventDefault();
        e.stopPropagation();
        //alert("stopped?")
    }
    if(active){
        activeSubtopic=topic.topic;
        
        window.history.pushState("", "", "/s/"+topic.topic);
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

function loadOptions(div,id){  
    if($('#optionsPane').length==0){
        $.post("/options",{id:getCookie("session"),topicId:id},function(options){
            $(options).insertBefore($(div).find("hr")).hide().show('fast');
        });   
    }else{
         if($(div).find("#optionsPane").length>0){
             $("#optionsPane").hide("fast",function(){
                $("#optionsPane").remove();
             });
             return;
         }
         $("#optionsPane").hide("fast",function(){
            $("#optionsPane").remove();
            $.post("/options",{id:getCookie("session"),topicId:id},function(options){
                $(options).insertBefore($(div).find("hr")).hide().show('fast');
            });
        });
    }
}

function hideSubtopic(id,e){
    e.stopPropagation();
    $("#topic-"+id).hide('fast',function(){
        $("#topic-"+id).remove();
    });
}

function deleteSubtopic(id,e){
    e.stopPropagation();
    $.post("/delete",{id:getCookie("session"),subtopic:id},function(results){
        if(results=="ok"){
            $("#topic-"+id).hide('fast',function(){
                $("#topic-"+id).remove();
            });
        }else{
            alert(results);
        }
    });
}