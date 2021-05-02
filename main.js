"use strict";
var websocket;
var connected = false;


class MobileadoraClient {
	constructor() {
	}

	// uses data from frame to create all inputs, adjust viewport and 
	frame_load(frame_data) {
	}


	connect(ip_address) {
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
}
