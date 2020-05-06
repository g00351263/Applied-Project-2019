// Developer : Raja Naseer Ahmed Khan
// Applied Project Module.
// Babylon Shooting Car Game

// generic methods for developing server taken from Node Express website
//https://expressjs.com/en/starter/hello-world.html
// dependencies//
var express = require('express'); // required for developing server
var socket = require('socket.io'); // required for socket io communication for mutiple instance in browser


var count = 0;
var app = express();

app.use("/", express.static(__dirname));
app.get("/", function(req, res)
{
	res.sendFile("index.html");
});


var server = app.listen(3000, function () {
    console.log("server just started listening on port 3000 ....");

});//localhost:3000


var io = socket(server);
io.set('transports', ['websocket']);


//////// End of Server Generic///////

// this is MVC basis view to store car object and display it//
var cars = {};

// this is generic method from www.socket.io //
io.on("connection", function (socket) {
	
	// showing on command prompt of server details of socket id assigned to client //
    console.log("Gamer Id Connected: " + socket.id);
	
	// sending the details to client using emit method uniqueSocketId //
    socket.emit("uniqueSocketId", { id : socket.id });
	
	// getting the http result back from client under method name Appreciated
    socket.on("Appreciated", function () {
		
		// showing on command prompt of server details of socket id assigned to client //
        console.log("Gamer ID is :" + socket.id );
    });

	
	// when browser is launched and car instance created this method is recieved
	// this will store the details in cars array and each new window opens get new socket id to render on canvas and show visibility of each player location to others.
    socket.on("developed", function (details) { // incoming //
        
		// assigning the all details of car with incoming data
        cars[details.id] = details;
		
		// sending the car details to all clients as broadcast to render the car to others aswell and keep them updated with location of each other.
        socket.broadcast.emit("enemiesCar", details); // to everyone

		//storing details of other cars in array and sending it client to render in his browser
        for (key in cars) {
            if (key == socket.id) continue;
			// outgoing enemies details to client
            socket.emit("enemiesCar", cars[key]); // to client only
			
        }
        
        
    });
    
	
	//incoming// method pos, which is sending x,y,z cordinates and broadcasting it to everyone connected to render the updated position
    socket.on("pos", function (details) {
        cars[details.id] = details;
        socket.broadcast.emit("enemiesPosition", details); // everyone
		
        
    });

	// incoming // when someone closes the browser, this method deletes the id from array to destroy the visiblity of objects to others by broadcasting
    socket.on("Left", function (details) {
        delete cars[socket.id];
        socket.broadcast.emit("enemiesLeft", { id : socket.id });
    });

	// incoming when b is pressed rendering position of fireball x,y,z//
    socket.on("anotherbpressed", function (details){
        console.log(details);
        socket.emit("details to fire ball", details);

    });
	
	// incoming // chat message windowd to broadcast, recieve, and send chat //
    socket.on('join', function(details) {
        console.log(details);
        socket.on('messages', function(details) {
            socket.emit('broad', details);
            socket.broadcast.emit('broad',"<b style='color:blue;'>" + details + "</b>");
        });
    });
});

