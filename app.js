var express = require('express');
var parser = require('body-parser');
var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
var password = 'arsenal'
var app = express();
var port = process.env.PORT || 3000;
var io = require('socket.io').listen(app.listen(port));
console.log("Your server is running on port 3000");
var users = [];
var sockets = [];

app.set('views',__dirname+'/views');
app.set('view engine','pug');
app.use(express.static(__dirname+'/public'));
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

function encrypt(text) 
{
    var cipher = crypto.createCipher(algorithm,password)
  	var crypted = cipher.update(text,'utf8','hex')
  	crypted += cipher.final('hex');
  	return crypted;
}
function decrypt(text)
{
    var decipher = crypto.createDecipher(algorithm,password)
  	var dec = decipher.update(text,'hex','utf8')
  	dec += decipher.final('utf8');
  	return dec;
}
app.get('/',function(req,res){
	res.render('home',{
		login: 'false'
	});
});
app.get('/home',function(req,res){
	var user = decrypt(req.query.user);
	res.render('home',{
		login:'true',
		name: user,
		users: users
	});
});
app.get('/enter',function(req,res){
	var user = req.query.user;
	if(users.indexOf(user)==-1)
	{
		res.redirect('/home?user='+encrypt(user));
	}
	else
	{
		res.render('home',{
			login:'fail'
		});
	}
});
io.on('connection', function (socket) {
  	console.log('a user connected');
  	socket.on('create',function(data){
  		users.push(data.name);
  		sockets.push(socket);
      setInterval(function(){
        socket.emit('load',users);
      },1000);
  	});
  	socket.on('send',function(data){
  		console.log(data.message);
  		sockets[users.indexOf(data.to)].emit('message',{
  			from:data.from,
  			message:data.message
  		});
  	});
  	socket.on('disconnect',function(){
  		console.log('user disconncted');
  		var index = sockets.indexOf(socket);
  		if(index!=-1)
  		{
  			sockets.splice(index,1);
  			users.splice(index,1);
  		}
  	});
});