var websocket;

// Library stuff



function connect_to_server(ip_address, port) {
//	document.window.onbeforeunload = () => {
//		websocket.close();
//	}
	websocket = new WebSocket("ws://" + ip_address + ":" + port);


	// As soon as server connects
	websocket.onopen = () => {
		console.log("Socket connected!");

		// send message to server
		websocket.send("Iphone 6s\0");
	};

	websocket.onclose = () => {
		//confirm("Socket closed =(");
		console.log("Socket closed =(");
	};

	websocket.onmessage = (evt) => {
		evt.data;
		confirm("Received message: " + evt.data);
		confirm("Headers: " + evt.data.headers);
		console.log("Received message: " + evt.data);
	};
}

function send_message() {
	websocket.send("Hello my name is jeff basos");
}


