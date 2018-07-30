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
var session = require("express-session");
var MongoStore = require('connect-mongo')(session);
var crypto = require("crypto");
var Message  = require("./message");
var Room  = require("./room");
var User  = require("./user");
var key = "thekey%%123";

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/chat", function(err)
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
var sessionMiddleware = session({
    secret: "Rusty is the best and cutest dog in the world",
    //store: new MongoStore({ mongooseConnection:mongoose.connection }),
    resave: false,
    saveUninitialized: false
});


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(sessionMiddleware);



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
   successRedirect : "/" , 
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
  console.log("robin jain");
  res.redirect("/login");
}


/*var storage = multer.diskStorage({
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

//encryption using crypto

/*var key = "thekey%%123";
var text = "crypto is awesome";
var enc = crypto.createCipher("aes-256-ctr" , key).update(text , "utf-8" , "hex");
var dec = crypto.createDecipher("aes-256-ctr" , key).update(enc , "hex" ,"utf-8" );
console.log(enc); 
console.log(dec);*/ 


//socket setup
var io = socket(server);
var users = {};
io.on("connection" , function(socket){
  console.log("made a connection of server to client",socket.id	);
 
socket().use(function(socket, next){
  sessionMiddleware(socket.request, socket.request.res, next);
});
 
  console.log(socket.request.user);
  if(socket.request.isAuthenticated()){
  	console.log(socket.request.user);
  }
  else{
  	console.log("not logged in");
  }
/*socket.on("chat",function(data){
  io.sockets.emit("chat",data);
});*/
/*
socket.on("join" , function(data){
	console.log(data);
    x = data.room;
   console.log("user is enter the room");	

  
  console.log("user is join the room");
 });*/



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

/*function update (req,res,next){
   socket.on("tagdi" , function(data){
	var read = false;
  Room.update({room : data.room} , {read : read} , function(err,done){
    if(err)
    {
    	console.log(err);
    }else
    {
    	console.log(done);
    }
  });
});	
   return next();
}
*/


socket.on("chat" , function(data){
  console.log("enter chat event");
  console.log("===================");
  console.log(data);
  console.log("===================");
 /*    upload((err) => {
   if(err)
   {
    console.log(err);
   }
   else{
    //console.log(req.file);
    //var file = req.file;


     }
   });*/
  //var data = { data.room : data.room , data.handle : data.handle , data.message : data.message , data.file : `uploads/${req.file.filename}`} ; 
  /*var decmsg = crypto.createDecipher(aes-256-ctr , "key").update(data.message , "hex" , "utf-8");
   console.log(data);
   console.log(decmsg);*/
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

//delete rooom
/*
socket.on("deleteroom" , function(data){
  Room.remove({room : data.room} , function(err){
     if(err){
     	console.log(err)
     }else{
     	console.log("room is deleted");
     }
  });
});*/


});

/*app.post("/roominput" , function(req,res){
  var room = req.body.room;
  var data = {room : room};
   Room.create(data ,function(err , data){
       if(err){
       	console.log("something went wrong");
       	console.log(err);
       }else{
       	console.log("room is insert succesfully");
       	console.log(data);
       	res.render("chat1.ejs" , {data : data});
      }
    }); 
});*/




app.get("/signup" , function(req,res){
  res.render("register.ejs");
});

app.get("/login", function(req,res){
  res.render("login.ejs");
  console.log(req.user);
});


app.get("/", isLoggedIn ,function(req,res){
     res.render("chat.ejs");
  });
