const express = require('express');
const app = express();
const path = require('path');

app.set('views',__dirname+'/views');
app.set('view engine','ejs');
app.engine('html',require('ejs').renderFile);
app.use(express.static('public'));
// app.use(express.static(path.join(__dirname,'/')));

app.get('/',function(request,response){
    response.render('youtubeSectionPlayer.html');
});

var server = app.listen(process.env.PORT||'52484',()=>{
    console.log('App is listening on port 52484');
});