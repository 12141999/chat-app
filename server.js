var express = require("express");
var path=require('path');
var socket = require("socket.io");
var passport = require("passport");
var LocalStrategy  = require("passport-local");
var passportLocalMongoose  = require("passport-local-mongoose");
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
//var multer = require("multer");
//var session = require("express-session");
//var MongoStore = require('connect-mongo')(session);
var crypto = require("crypto");
var Message  = require("./message");
var Room  = require("./room");
var User  = require("./user");
var key = "thekey%%123";



app.set('views', path.join(__dirname, 'views'));
app.set("view engine" , "ejs");
app.use(express.static("public"));
app.use('', express.static(path.join(__dirname + '')));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world",
    resave: false,
    saveUninitialized: false
}));

/*app.use(sessionMiddleware);

socket().use(function(socket, next){
  sessionMiddleware(socket.request, socket.request.res, next);
});*/

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
   res.locals.currentUser = req.user;
   next();
});




mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/chat", function(err , db)
  {
    if(err)
    {
      console.log(err);
    }
    
      console.log("database has been connected!");


var io = socket(server);
//var users = {};
io.on("connection" , function(socket){
  console.log("made a connection of server to client",socket.id );
 
 let Message = db.collection('messages');

sendStatus = function(s){
  socket.emit(s);
}



socket.on("find" , function(data){
  
Message.find({room : data.room}).limit(100).sort({_id:1}).toArray(function(err,res){
  if(err)
  {
    console.log(err);
  }else{
    console.log("********************");
    console.log(res);
    console.log("********************");
    io.sockets.to(data.room).emit("chat" , res);
  }

});

});
/*  console.log(socket.request.user);
  if(socket.request.isAuthenticated()){
    console.log(socket.request.user);
  }
  else{
    console.log("not logged in");
  }*/


 socket.on("enter" , function(data){
  console.log(data);
   console.log("user is enter in the room");
  
   Room.create(data ,function(err , data){
       if(err){
        console.log("something went wrong");
        console.log(err);
       }else{
        console.log("room is insert succesfully");
        console.log(data);
        socket.join(data.room);
      }
    }); 
   
});


socket.on("chat" , function(data){
  console.log("enter chat event");
  console.log("===================");
  console.log(data);
  console.log("===================");
   
 io.sockets.to(data.room).emit("outputs" , data);
});

socket.on("insert" , function(data){
  //var encmsg = crypto.createCipher("aes-256-ctr" , key).update(data.message , "utf-8" , "hex" );
  var handle = data.handle;
  var message = data.message;
  var room = data.room;
   /*if(name=" " || encmsg=" ")
   {
    sendStatus("please enter a name and status");
   }else{*/

  var data = { handle : handle , message : message , room : room  };
  Message.insert(data , function(err , result){
   if(err)
   {
    console.log(err);
   }else{
     console.log("inserting is succesfully");
   }
 });
/*}*/
});

socket.on("typing" , function(data){
   socket.broadcast.to(data.room).emit("typing" , data); 
});

//clear chat
socket.on("clear" , function(){
  Message.remove({} , function(err){
     if(err){
      console.log(err)
     }else{
      console.log("chat is deleted");
      socket.emit("cleared");
     }
  });
});


});




  });

var server = app.listen("7089" , function(){
  console.log("server is started");
});

// user signup 
app.post("/signup" , function(req,res){
var username = req.body.username;
var password = req.body.password;
var mobileno = req.body.mobileno;
var email = req.body.email;
var address = req.body.address;
User.register(new User ({username : username , mobileno : mobileno , email : email , address : address }) , password , function(err,user){
  if(err){
  	console.log(err);
  }else{
  	res.render("chat.ejs");
  }
});
});



app.post("/login" , passport.authenticate("local",{
   successRedirect : "/chat" , 
   failureRedirect : "/login"
}), function(req,res){
});

app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/");
});


function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

/*
var storage = multer.diskStorage({
  destination : "./views/uploads/",
  filename : function(req,file,cb){
    cb(null , file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

//upload

var upload = multer({
  storage : storage,
  limits : {fileSize : 1000000000000000}
}).single("myImage");*/


//socket setup



app.get("/signup" , function(req,res){
  res.render("register.ejs");
});

app.get("/login", function(req,res){
  res.render("login.ejs");
  //console.log(req.user);
});


app.get("/chat", isLoggedIn ,function(req,res){
     res.render("chat.ejs");
  });

app.get("/" , function(req,res){
  res.render("home.ejs");
});