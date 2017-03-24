var socket = io.connect('http://localhost:3000');
var users = [];
var messages = {};
var receiver = '';
function addsent(message)
{
	var box = document.getElementById('chatbox');
	var textcanvas = document.createElement('div');
	textcanvas.className = 'sentmessage';
	var textmessage = document.createElement('p');
	textmessage.className = 'message';
	textmessage.innerHTML = username+': '+message;
	textcanvas.appendChild(textmessage);
	box.appendChild(textcanvas);
}
function addrecv(message)
{
	var box = document.getElementById('chatbox');
	var textcanvas = document.createElement('div');
	textcanvas.className = 'recvmessage';
	var textmessage = document.createElement('p');
	textmessage.className = 'message';
	textmessage.innerHTML = receiver+': '+message;
	textcanvas.appendChild(textmessage);
	box.appendChild(textcanvas);
}
window.onload = function()
{
	document.getElementById('message').disabled = true;
	socket.emit('create',{ name:username });
	socket.on('load',function(data){
		users = data;
		var element = document.getElementsByTagName('li'), index;
		for (index = element.length - 1; index >= 0; index--) {
    		element[index].parentNode.removeChild(element[index]);
		}
		for(i=0;i<users.length;i++)
		{
			if(username==users[i])
			{
				continue;
			}
			var ul = document.getElementById('chatlist');
			var li = document.createElement('li');
			var a = document.createElement('a');
			a.appendChild(document.createTextNode(users[i]));
			a.setAttribute('href','#');
			a.className = 'names';
			li.appendChild(a);
			if(receiver==users[i])
			{
				li.className = 'active';
			}
			ul.appendChild(li);
		}
		for(i=0;i<users.length;i++)
		{
			var temp = [];
			messages[users[i]] = { messages:temp, read: true};
		}
	});
	socket.on('message',function(data){
		
		messages[data.from].messages.push({
			from:data.from,
			message:data.message
		});
		messages[data.from].read = false;
		if(receiver==data.from)
		{
			addrecv(data.message);
		}
		else
		{
			var list = getElementsByTagName('a');
			for(i=0;i<list.length;i++)
			{
				if(data.from==list[i].innerHTML)
				{
					var target = list[i].parent;
					target.className += 'success';
				}
			}
		}
	});
	document.getElementById('send').onclick = function()
	{
		var message = document.getElementById('message').value;
		document.getElementById('message').value = '';
		messages[receiver].messages.push({
			from:username,
			message:message
		});
		addsent(message);
		socket.emit('send',{
			to:receiver,
			from:username,
			message:message
		});
	}
	document.getElementById('chatlist').onclick = function(event)
	{
		var element = event.target;
		receiver = element.innerHTML;
		document.getElementById('message').disabled = false;
		messages[element.innerHTML].read = true;
	}
	document.getElementById('message').addEventListener("keyup",function(event) 
	{
    	event.preventDefault();
    	if (event.keyCode == 13) {
        	document.getElementById('send').click();
    	}
	});
}	