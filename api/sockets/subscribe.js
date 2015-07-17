var path = require('path'),
  fs = require('fs'),
  moment = require('moment'),
  uuid = require('uuid-v4'),
  Room = require('../../lib/room'),
  _ = require("underscore");
module.exports = function(io, socket,sub,pub,client) {

	var people = {};
	var rooms = {};
	var sockets = [];


	socket.on('joinserver', function() {

		var user = { 
			id : socket.decoded_token._id,
			socket: socket.id 
		};

		client.set(user.id, JSON.stringify(user) , function (err) {
	        if (err) {
	            console.log(err)
	        }
    	});
		var activitesRoom = new Room('activitesRoom',0);
		//var personelRoom = new Room(user.name,socket.decoded_token._id);
		
		activitesRoom.addPerson(socket.id);	
		socket.join(activitesRoom);
		//socket.join(personelRoom);

		socket.emit("update", "You have connected to the server.");
		//socket.broadcast.emit("update", user.name + " is online.")
		
		//sub.subscribe(user.name);
		sub.subscribe('activitesRoom');

		pub.publish('subscribe',JSON.stringify({
            type: 'status',
            text: 'Is now connected',
            created: Date.now()
        }));
	});
	    
 

	socket.on("leaveRoom", function(id) {
		var room = rooms[id];
		if (room)
			purge(socket, "leaveRoom");
	});
	socket.on("removeRoom", function(id) {
		 var room = rooms[id];
		 if (socket.id === room.owner) {
			purge(socket, "removeRoom");
		} else {
                	socket.emit("update", "Only the owner can remove a room.");
		}
	});

};

