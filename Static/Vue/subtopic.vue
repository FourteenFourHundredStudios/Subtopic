<template>
    <div style="width:100%;margin-bottom:0px;text-overflow: ellipsis;">
        <h1 style="display: inline-block;">{{ supertopic.topic }} </h1>
    </div>
    <div class="card">
        <div class="cardBody" style="">
            <div v-for="topic in subtopics" class="CardContainer" id="" onClick="loadOptions(this,'<%=topic.id%>',event)" >
                <a onClick="loadSubtopic('#subtopicPane',{topic:'<%= topic.id %>'},true,event);"> 
                    {{ topic.topic }}
                </a>
                <div class="cardContent">
                    {{ topic.body }}
                </div>
                <hr>
            </div>
            <center><button onClick="showMore('<%= supertopic.id %>')" class="button" style="color:rgb(34,224,151)">Show More</button></center>
        </div>
    </div>
</template>

<script>

    module.exports = {
        data: function () {
            return {
                subtopics: [],
                supertopic: "loading..."
            }
        },
        created: function () {
            console.log('my-component created!')
        },
        
    }

</script>