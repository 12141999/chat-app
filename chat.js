//make connections





//variables



//query DOM

var message = document.getElementById("message"),
    handle = document.getElementById("handle"),
    btn = document.getElementById("send"),
    output = document.getElementById("output"),
    feedback = document.getElementById("feedback"),
    clear  = document.getElementById("clear"),
    room = document.getElementById("room"),
    rjsend = document.getElementById("rjsend"),
    droom = document.getElementById("droom");
    chatwin = document.getElementById("chat-window");
    mariochat = document.getElementById("mario-chat"),
    status = document.getElementById("status");


var statusDefault = status.textContent;
var setStatus = function(s){
  status.textContent = s;
  if(s !== statusDefault)
  {
    var delay = setTimeout(function(){
      setStatus(statusDefault);
    },4000);
  }
}
//encyption
//var encmsg = crypto.createCipher("aes-256-ctr" , key).update(message.value , "utf-8" , "hex");



var socket = io.connect("http://localhost:7089");
if(socket != undefined)
{
  console.log("connected to socket...");
}


//room criteria

rjsend.addEventListener("click" , function(){
  socket.emit("enter" , {
    room : room.value
  });
  rjsend.style.display = "none";
  room.style.display = "none";
  clear.style.display = "block";
  message.style.display = 'block';
  handle.style.display = 'block';
  btn.style.display = 'block';
  chatwin.style.display = 'block';
  mariochat.style.display = 'block';
});


rjsend.addEventListener("click" , function(){
  socket.emit("tagdi" , {
    room : room.value
  });
});

//Emit event

btn.addEventListener("click",function(){
  socket.emit("chat",{
  	room : room.value,
    message : message.value,
    handle : handle.value
  });
});

btn.addEventListener("click" , function(){
  socket.emit("find", {
    room : room.value,
    handle : handle.value
  });
});

btn.addEventListener("click" , function(){
  socket.emit("insert" , {
    message : message.value,
    handle : handle.value,
    room : room.value
  });
});

message.addEventListener("keypress" , function(){
	socket.emit("typing" , {
	  room : room.value,
    handle : handle.value
	});
});
//output

socket.on("outputs" ,function(data){
  console.log("hurrrrrrrrrrrrrrrrrrrrrrrrreeeeeeeeeeeeeeeeeeee");
	console.log(data);
  // var decmsg = createDecipher(aes-256-ctr , "key").update(data.message , "hex" , "utf-8");
  //console.log(decmsg);
feedback.innerHTML = "";
output.innerHTML = "<p><strong>" + data.handle +  " : </strong>"  +data.message +"</p>";
//output.innerHTML += "<img src=" + file +  ">"
//output.innerHTML += "<p> send </p>"
});

socket.on("typing" , function(data){
 feedback.innerHTML = "<p><strong>" + data.handle + "</strong> is typing....</p>"
});

/*
socket.on("privious" , function(res){
  console.log("yeahhhhhhhhhhhhhhhhhhhhhhhh");
  console.log(res);
  console.log("yeahhhhhhhhhhhhhhhhhhhhhhhh");
 output.innerHTML += "<p><strong>" + res.handle + " : </strong" + res.message + '</p>';
});
*/
 
socket.on("chat" , function(data){
    if(data.length){
      for(var x=0 ; x < data.length; x++)
      {
        var chatwin = document.createElement("div");
        chatwin.setAttribute("class" , "chat - message");
        chatwin.innerHTML = "<p><strong>" + data[x].handle + "</strong> :"  + data[x].message + "</p>";
        output.appendChild(chatwin);
        output.insertBefore(chatwin , output.firstChild);
      }
    }
});

//clear chat
clear.addEventListener("click" , function(){
  socket.emit("clear");
});
/*
droom.addEventListener("click" , function(){
  socket.emit("droom", {
  	room : room.value
  });
});*/

/*function closeWin()
{
  if(myWindow.close(); === true)
{
   socket.emit("deleteroom" , {
     room : room.value
   });
}
}*/

socket.on("cleared" , function(){
  output.textContent = "";
});