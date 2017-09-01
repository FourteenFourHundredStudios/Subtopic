function loadImports(cb){
    imports=["subtopic.html","pages/home.html"];
    i=-1;
    getNext();
    function getNext(){  
        i++;
        if(i==imports.length){
            cb();
            return;
        }
        $("body").append("<div id='includedContent"+i+"'></div>");
        $("#includedContent"+i).load("/static/components/"+imports[i],getNext);
    }   
}
