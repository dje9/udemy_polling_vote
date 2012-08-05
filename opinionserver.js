/* 
Source file: opinionserver.js

---
Copyright (c) 2012 All Right Reserved, C. A. Cois
http://www.codehenge.net

THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY 
KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
PARTICULAR PURPOSE.

Node.js is an official trademark of Joyent. This software is not 
formally related to or endorsed by the official Joyent Node.js open 
source or commercial project.
*/

//*************
// Express App
//*************

// We know how to write our own, but why not use express?
var express = require('express');
var app = express.createServer();

app.configure(function(){
	app.set('view options', {layout: false});
	app.use(express.static(__dirname + '/public'));	
});

// register a simple html view engine, instead of using a fancy view rendering system
app.register('.html', {
  compile: function(str, options){
    return function(locals){
      return str;
    };
  }
});

app.get('/test', function(req, res){
	res.send('Hello, World!');
});

app.get('/vote', function(req, res){
    res.render('votingclient.html', { title: 'Voting Client' });
});

app.get('/chart', function(req, res){
    res.render('livechartclient.html', { title: 'Live Chart Client' });
});

app.listen(3035);

//*********************
// Socket.io Functions
//*********************

var io = require('socket.io').listen(app);
var votes = new Array();

// on a 'connection' event
io.sockets.on('connection', function(socket){

    console.log("Connection " + socket.id + " accepted.");
    
	socket.on('vote', function(vote){
	    // record vote
	    console.log("Client " + socket.id + " voted " + vote);
		votes[socket.id] = vote;
		print_votes();
	});
    
	socket.on('ticker', function(fn){
	    console.log("Sending vote average to client " + socket.id);
		var total = 0, ctr = 0;
		for(var v in votes){
			total += votes[v];
		    ctr++;
		}
		// return vote average to client
		var average = total/ctr;
		console.log("Average: " + total + "/" + ctr + " = " + average);
		fn(total);
	});

    socket.on('disconnect', function(){
        console.log("Connection " + socket.id + " terminated.");
    });
    
});

print_votes = function(){
    var total = 0;
	console.log("\nVotes:");
    for(var v in votes){
        console.log("\tvotes[" + v + "] = " + votes[v]);
    }
	console.log("\n");
}


