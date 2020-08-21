const express = require('express');
const app = express();
const path = require('path');
const port = normalizePort(process.env.PORT||'52484');
app.set('port',port);
app.use(express.static(path.join(__dirname,'/')));

app.get('/',function(request,response){
    response.render('youtubeSectionPlayer.html');
});

var server = app.listen(PORT,()=>{
    console.log('App is listening on port ${PORT}');
});