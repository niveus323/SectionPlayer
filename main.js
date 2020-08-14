const http = require('http');
const fs = require('fs');
const url = require('url');
const { request } = require('https');

var app = http.createServer(function(request,response){
    fs.readFile('youtubeSectionPlayer.html',function(err,data){
        if(err){
            console.log('file read Error!');
        }else{
            response.writeHead(200, { 'Content-Type' : 'text/html;  charset=utf-8'});
            response.end(data);
        }
    });
}).listen(52484,function(){
    console.log('server running at http://localhost:52484');
})