
loadSubtopic("#subtopicPane",{topic:"supertopic",index:0,count:10},true);
loadSubtopic("#suggestionPane",{topic:"supertopic"});

if(getCookie("session").length!=0){
    $.post("/load",{id:getCookie("session"),page:"openSubtopic"},function(div){       
        $("#loginForm").fadeOut("fast",function(){
            $("#loginForm").replaceWith(div);
            $('#subtopicForm').fadeIn("fast");
        });
    });
}

$("#loginButton").click(function(){
    query={username:$("#username").val(),password:$("#password").val()};
    $.post("/login",query,function(result){
        if(result.status=="ok"){
            key=result.message;
            $.post("/load",{id:key,page:"openSubtopic"},function(div){       
                setCookie("session",key,30);
                $("#loginForm").fadeOut("fast",function(){
                    $("#loginForm").replaceWith(div);
                    $('#subtopicForm').fadeIn("fast");
                });
            });
        }else if(result.status=="error"){
            alert(result.message);
        }
    });
});


function loadSubtopic(id,topic,active){
    if(active)activeSubtopic=topic.topic;
    $.post("/subtopic",topic,function(div){
        $(id).fadeOut("fast",function(){
            $(id).html(div);
            $(id).fadeIn("fast");
        });
    });
}
