/*
    TODO
    1. EndPoint가 StartPoint보다 앞에있으면 오류를 알릴것
    2. 모바일 환경에서도 자동재생이 되도록 mute=1로 실행후 재생시 mute 끄기
    3. 서버 베포 (heroku, cafe24 등등)
    4. 재생목록 추가시 이전 재생목록의 동영상 id복사하여 value 설정
    5. 재생목록 저장기능 추가
    6. 작은 화면에서 재생목록 css 변경(추후 추가 수정 예정)
    7. 재생목록 변경기능 추가
*/
const winmedia = window.matchMedia('(min-width: 1145px)');

function reSize(){ 
    let elem_youtube = document.getElementsByClassName('youtube')[0]
    let elem_option = document.getElementById('options');
    let padding_option = window.getComputedStyle(elem_option).padding;
    if(winmedia.matches){//큰화면
        let height = elem_youtube.offsetHeight;
        height -= parseFloat(padding_option)*2;
        elem_option.style.height = height;
        elem_option.style.removeProperty('width');
    }else{    //작은화면
        
        let width = elem_youtube.offsetWidth;
        width -= parseFloat(padding_option)*2+1;
        elem_option.style.width = width;
        elem_option.style.removeProperty('height');
    }
}

//재생시간 밑 동영상 목록을 위한 List구조
function List(){
    this.elements ={};
    this.index=0;
    this.length=0;
}
List.prototype.add = function(element){
    this.length++;
    this.elements[this.index++]=element;
}
List.prototype.get=function(idx){
    return this.elements[idx];
}
List.prototype.clear=function(){
    this.elements = {};
    this.index=0;
    this.length=0;
}
List.prototype.set=function(idx,element){
    this.elements[idx]=element;
    if(this.length<idx){
        this.length=idx;
    }
    if(this.index<idx){
        this.index = idx;
    }
}

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
var videolist = new List();
var starttimes = new List();
var endtimes = new List();

var videotime=0;
var timeupdater=null;

var tablenum =0;    //몇개의 재생목록을 받는 div가 생성되었는지 확인받는 변수
var currentidx=0;
var starttime;
var endtime;

var state;  //0 - 로드하고 재생 전, 1 - 재생 중, 2 - 완료

function onYouTubeIframeAPIReady(){
    videolist.add("IOFetSmuOPs");   //기본 재생 동영상 ID mFzHr8Xyo6E
    player = new YT.Player('player',{
        host:'https://www.youtube.com',
        videoId: videolist.get(0),         
        events:{
            'onReady': onPlayerReady
        },
        playerVars:{
            'disablekb' : 1,
            'controls' : 1
        }
    });
}

//동영상 준비되면 발생하는 함수
function onPlayerReady(event){ 
    function updateTime(){
        var oldTime = videotime;
        if(player&&player.getCurrentTime){
            videotime=player.getCurrentTime();//동영상의 현재 재생시간을 기준으로 타이머를 설정
        }
        if(videotime!= oldTime){
            onProgress(videotime);
        }
    }
    timeupdater = setInterval(updateTime,100);
    starttimes.add(2361);
    endtimes.add(2456);
    starttime =starttimes.get(0);
    endtime = endtimes.get(0);
    player.seekTo(starttime);
    event.target.playVideo();
}

function onProgress(currentTime){
    if(state===0){
        if(currentTime!=starttime){
            //console.log("시작시간 재설정 중");
            player.seekTo(starttime);
        }else{
            state=1;
        }
    }else if(currentTime>endtime){
        state=2;  
        if(currentidx>=tablenum) {
            let repeatbox = document.getElementById("player-button-repeat");
            if(repeatbox.checked)    play(0);
            else   player.stopVideo();
        }
        else{          //다음 영상 재생
            play(currentidx+1);
            console.log("current idx = "+currentidx);
        }
    }
}

function redrawPlayer(){//동영상 재생목록 업데이트
    updateLists();
    play(0);
}

function caltime(str){
    let colidx = str.indexOf(':');
    if(colidx!=-1){
        let min = str.substring(0,colidx);
        let second = str.substring(colidx+1,str.length);
        return parseInt(min)*60+parseInt(second);
    }else   return parseInt(str);
}

function setPoint(num){
    console.log("current index is "+num);
    videolist.set(num,getIdFromUrl(document.getElementById("playerContent"+num).value));
    starttimes.set(num,caltime(document.getElementById("playerStartPoint"+num).value));
    endtimes.set(num,caltime(document.getElementById("playerEndPoint"+num).value));
    
    let table = document.getElementById("player-functions-table"+num);
    table.classList.remove("listbox-not-applied");
    table.classList.add("listbox-applied");

    console.log(num+"-> "+"id="+videolist.get(num)+", start="+starttimes.get(num)+", end="+endtimes.get(num));
}

function deletePoint(num){  //id 변경 및 setpoint인자 변경
    let dtable = document.getElementById("player-functions-table"+num);
    dtable.parentNode.removeChild(dtable);
    
    for(i=num+1;i<=tablenum;i++){
        let table = document.getElementById("player-functions-table"+i);
        let video = document.getElementById("playerContent"+i);
        let start = document.getElementById("playerStartPoint"+i);
        let end = document.getElementById("playerEndPoint"+i);
        let pbutton = document.getElementById("player-button-play"+i);
        let sbutton = document.getElementById("player-button-set"+i);
        let dbutton = document.getElementById("player-button-delete"+i);
        table.id = "player-functions-table"+(i-1);
        video.id = "playerContent"+(i-1);
        start.id = "playerStartPoint"+(i-1);
        end.id = "playerEndPoint"+(i-1);
        pbutton.id="player-button-play"+(i-1);
        pbutton.setAttribute("onClick","play("+(i-1)+")");
        sbutton.id = "player-button-set"+(i-1);
        sbutton.setAttribute("onClick","setPoint("+(i-1)+");");
        dbutton.id="player-button-delete"+(i-1);
        dbutton.setAttribute("onClick","deletePoint("+(i-1)+")");
        }
    tablenum--;
}

function addTable(){
    var newTable = document.createElement("table");
    newTable.setAttribute("id","player-functions-table"+(++tablenum));
    console.log("재생목록 추가"+tablenum);
    newTable.setAttribute("class","listbox listbox-not-applied");
        var sectiontable="<tbody>";
            sectiontable+="<tr>";
                sectiontable+="<td class=\"noborder player-group-header\">동영상 ID</td>";
                sectiontable+="<td class=\"player-group-options\">"
                    sectiontable+="<div class=\"player-option-row\">";
                        sectiontable+="<input type=\"text\" class=\"player-text-input\" size=\"18\" id=\"playerContent"+tablenum+"\" value=\"mFzHr8Xyo6E\" alt=\"동영상 ID를 입력하세요\">"
                    sectiontable+="</div>";
                sectiontable+="</td>";
                sectiontable+="<td class=\"player-group-button\">";
                        sectiontable+="<button id=\"player-button-play"+tablenum +"\" type=\"button\" class=\"button\" onclick=\"play("+tablenum +");\"><i class=\"fas fa-play\"></i></button>";
                    sectiontable+="</td>";
            sectiontable+="</tr>";            
            sectiontable+="<tr>";
                sectiontable+="<td class=\"noborder player-group-header\">시작 지점</td>";
                sectiontable+="<td class=\"player-group-options\">";
                    sectiontable+="<div class=\"player-option-row\">";
                        sectiontable+="<input type=\"text\" class=\"player-text-input\" size=\"18\" id=\"playerStartPoint"+tablenum +"\" value=\"2361\" alt=\"2361\">"
                    sectiontable+="</div>";
                sectiontable+="</td>"
                sectiontable+="<td class=\"player-group-button\">"
                    sectiontable+="<button id=\"player-button-set"+tablenum+"\" type=\"button\" class=\"button\" onclick=\"setPoint("+tablenum+");\"><i class=\"fas fa-check\"></i></button>"
                sectiontable+="</td>"
            sectiontable+="</tr>"
            sectiontable+="<tr>"
                sectiontable+="<td class=\"noborder player-group-header\">종료 지점</td>"
                sectiontable+="<td class=\"player-group-options\">"
                    sectiontable+="<div class=\"player-option-row\">"
                        sectiontable+="<input type=\"text\" class=\"player-text-input\" size=\"18\" id=\"playerEndPoint"+tablenum +"\" value=\"2456\" alt=\"2456\">";
                    sectiontable+="</div>"
                sectiontable+="</td>"
                sectiontable+="<td class=\"player-group-button\">"
                    sectiontable+="<button id=\"player-button-delete"+tablenum+"\" type=\"button\" class=\"button\" onclick=\"deletePoint("+tablenum+");\"><i class=\"far fa-trash-alt\"></i></button>"
                sectiontable+="</td>"
            sectiontable+="</tr>"
        sectiontable+="</tbody>"
    newTable.innerHTML = sectiontable;
    var tableparent = document.getElementById("player-functions");
    tableparent.appendChild(newTable);
}

function updatePoints(){
    starttimes.clear();
    endtimes.clear();
    console.log("tablenum is "+tablenum);
    for(i=0;i<=tablenum;i++){
        var sid="playerStartPoint"+i;
        var eid="playerEndPoint"+i;
        starttimes.add(caltime(document.getElementById(sid).value));
        endtimes.add(caltime(document.getElementById(eid).value));
        console.log(i+"-> "+" start="+starttimes.get(i)+", end="+endtimes.get(i));
    }
}
function updateLists(){
    videolist.clear();
    starttimes.clear();
    endtimes.clear();
    for(i=0;i<=tablenum;i++){
        videolist.add(getIdFromUrl(document.getElementById("playerContent"+i).value));
        starttimes.add(caltime(document.getElementById("playerStartPoint"+i).value));
        endtimes.add(caltime(document.getElementById("playerEndPoint"+i).value));
        console.log(i+"-> "+"id="+videolist.get(i)+", start="+starttimes.get(i)+", end="+endtimes.get(i));
    }
}        

function getIdFromUrl(str){
    if(str.indexOf("https")!=-1){   //URL입력에 두가지 경우의 수 존재
    //1.웹브라우저의 주소 링크(https://youtube.com/watch?v=(id))
        let pos = str.indexOf('v=');
        let substr;
        let qpos;
        if(pos!=-1)   substr = str.substring(pos+2,str.length);
        //2.유튜브 내의 공유 링크(https://youtu.be/(id))
        else{
            pos = str.indexOf('u.be/');
            substr = str.substring(pos+5,str.length);
        }
        qpos = substr.indexOf('?');
        if(qpos!=-1){
            return substr.substring(0,qpos);
        }
        return substr;
    }else{//URL입력이 아닌경우
        return str;
    }

}

function loadvideo(){
    var url = player.getVideoUrl();
    var andpos=url.indexOf('v=');
    var id;
    if(andpos != -1){
        id = url.substring(andpos+2,url.length);
    }else{
        id = url;
    }
    // console.log(id);
    if(id!=videolist.get(currentidx)){
        player.loadVideoById(
            {'videoId':videolist.get(currentidx), 'starttime':starttimes.get(currentidx)});
    }
}

function  play(idx){
    state=0;
    let table = document.getElementById("player-functions-table"+currentidx);
    table.classList.remove("listbox-playing");
    table.classList.add("listbox-applied"); 

    currentidx=idx;
    setPoint(idx);
    loadvideo();
    starttime = starttimes.get(idx);
    endtime = endtimes.get(idx);

    table = document.getElementById("player-functions-table"+idx);
    table.classList.remove("listbox-applied");
    table.classList.add("listbox-playing");

    console.log("starttime="+starttime+", endttime="+endtime);
    player.seekTo(starttime);
}

