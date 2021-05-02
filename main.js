"use strict";
var websocket;
var connected = false;


// uses data from frame to create all inputs, adjust viewport and 
function frame_load(frame_data) {
}


function connect_to_server(ip_address) {
	websocket = new WebSocket("ws://" + ip_address);

	// As soon as server connects
	websocket.onopen = () => {
		console.log("Socket connected!");
		console.log('Connected to server!');
		connected = true;

		// send message to server
		//websocket.send("Connected!");
	};

	websocket.onclose = () => {
		console.log('Server closed =(');
		//confirm("Socket closed =(");
		console.log("Socket closed =(");
		connected = false;
	};

	websocket.onmessage = (evt) => {
		evt.data;
		console.log("Received message: " + evt.data);

		// read header


		// if frame

	};
}
