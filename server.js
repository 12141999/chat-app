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

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://robinjain12:robinjain12@@ds159631.mlab.com:59631/chat", function(err)
  {
    if(err)
    {
      console.log(err);
    }
    else
   {
      console.log("database has been connected!");
         }
  });

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
   successRedirect : "/" , 
   failureRedirect : "/login"
}), function(req,res){
});

app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/login");
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
var io = socket(server);
//var users = {};
io.on("connection" , function(socket){
  console.log("made a connection of server to client",socket.id	);
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
/*     upload(req,res,(err) => {
   if(err)
   {
    console.log(err);
   }
   else{
    console.log(req.file);
     }
   });*/
 io.sockets.to(data.room).emit("chat" , data);
});

socket.on("insert" , function(data){
  var encmsg = crypto.createCipher("aes-256-ctr" , key).update(data.message , "utf-8" , "hex" );
  var name = data.handle;
  var file = data.file;
  var data = { message : encmsg , handle : name , file : file};
  Message.create(data , function(err , result){
   if(err)
   {
   	console.log(err);
   }else{
   	 console.log("inserting is succesfully");
   }
 });
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



app.get("/signup" , function(req,res){
  res.render("register.ejs");
});

app.get("/login", function(req,res){
  res.render("login.ejs");
  //console.log(req.user);
});


app.get("/", isLoggedIn ,function(req,res){
     res.render("chat.ejs");
  });

var port = process.env.PORT || 5000 ;

var server = app.listen(port , function(){
  console.log("server is started");
});