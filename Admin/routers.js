
app.get('/admin', function(req, res){
    url=req.params["url"];
    if(url=="")url="supertopic";
    res.send('adminstuff')
});
