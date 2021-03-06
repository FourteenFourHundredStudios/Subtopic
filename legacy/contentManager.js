

socket = io();

socket.on('notes', function(msg){
    if(msg.result>0){
        $("#notes").html("<span style='color:rgb(44,244,171)'>Notifications ("+msg.result+")</span>");
    }else{
        $("#notes").html("Notifications");
    }
});

if(getUrlParameter("q")=="v"){
    alert("Your account has successfully been activated! Please sign in!")
}

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

function loadNotes(){
    $.post("/notes",{id:getCookie("session")},function(div){
        $("#topPane").hide().html(div).show("slow");
    });
}

function subComment(url,e){
    e.preventDefault();
    e.stopPropagation();
    loadSubtopic('#subtopicPane',{topic:url},true);
    $("#topic").val("<subcomment>");
    $("#topic").focus();
    $("#body").focus();
}

function loadSubtopic(id,topic,active,e){

   //  console.log(query);

    $("html, body").animate({ scrollTop: 0 }, "fast");
    if(getCookie("session")!=undefined)topic["userId"]=getCookie("session");
    if(e!=undefined){
        e.preventDefault();
        e.stopPropagation();
    }
  
    $.post("/subtopic",topic,function(div){
        console.log(topic);
        $(id).fadeOut("fast",function(){
            $(id).html(div);
            $(id).fadeIn("fast");
        });
    });

    if(active){
        activeSubtopic=topic.topic;
        window.history.pushState("", "", "/s/"+topic.topic);


        //alert(topic.topic);
        $.post("/subtopic/"+activeSubtopic,{topic:"topic",content:true},function(div){
            $("#supertopicPane").fadeOut("fast",function(){
                $("#supertopicPane").html(div);
                $("#supertopicPane").fadeIn("fast");
            });
        });

    }

}



function logout(){
    deleteCookie("session");
    location.reload();
}

function showMore(topic,id,page){
    query={topic:topic,index:page+1,nobody:true};
    if(getCookie("session")!=undefined)query["userId"]=getCookie("session");
    $.post("/subtopic",query,function(content){
       
        $("#nextContent"+id).replaceWith(content);
    });
}

function loadOptions(div,id,e){ 
    //e.preventDefault();
    //e.stopPropagation();


    if($('#optionsPane').length==0){
        $.post("/options",{id:getCookie("session"),topicId:id},function(options){
            $(options).insertBefore($(div).find("here")).hide().show('fast');
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
                $(options).insertBefore($(div).find("here")).hide().show('fast');
            });
        });
    }
    
}

function hideSubtopic(id,e){
    e.stopPropagation();
    $("[id=topic-"+id+"]").hide('fast',function(){
        $("[id=topic-"+id+"]").remove();
    });
}

function deleteSubtopic(id,e){
    e.stopPropagation();
    var willDelete = confirm("Are you sure you want to delete this Subtopic?");
    if(willDelete){
        $.post("/delete",{id:getCookie("session"),subtopic:id},function(results){
            if(results=="ok"){
                $("[id=topic-"+id+"]").hide('fast',function(){
                    $("[id=topic-"+id+"]").remove();
                });
            }else{
                alert(results);
            }
        });
    }else{
        console.log("Subtopic "+id+" thanks you for saving it's life");
    }
}