//make connections

var socket = io.connect("https://robinchats.herokuapp.com/apps/robinchats/");





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
    read = document.getElementById("read");



//encyption
//var encmsg = crypto.createCipher("aes-256-ctr" , key).update(message.value , "utf-8" , "hex");





//room criteria

rjsend.addEventListener("click" , function(){
  socket.emit("enter" , {
    room : room.value,
    read : read.value
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
   /* file : file.value*/
  });
});

btn.addEventListener("click" , function(){
  socket.emit("insert" , {
    message : message.value,
    handle : handle.value
    //file : file.value
  });
});

message.addEventListener("keypress" , function(){
	socket.emit("typing" , {
	  room : room.value,
    handle : handle.value
	});
});
//output

socket.on("chat" ,function(data){
  console.log("hurrrrrrrrrrrrrrrrrrrrrrrrreeeeeeeeeeeeeeeeeeee");
	console.log(data);
  // var decmsg = createDecipher(aes-256-ctr , "key").update(data.message , "hex" , "utf-8");
  //console.log(decmsg);
feedback.innerHTML = "";
output.innerHTML += "<p><strong>" + data.handle +  " : </strong>"  +data.message +"</p>";
//output.innerHTML += "<img src=" + file +  ">"
//output.innerHTML += "<p> send </p>"
});

socket.on("typing" , function(data){
 feedback.innerHTML = "<p><strong>" + data.handle + "</strong> is typing....</p>"
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