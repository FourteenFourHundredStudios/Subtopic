function loadImports(cb){
    imports=["subtopic.html"];
    i=-1;
    getNext();
    function getNext(){  
        i++;
        if(i==imports.length){
            cb();
            return;
        }
        $("#includedContent").load("/static/components/"+imports[i],getNext);
    }   
}
