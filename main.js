"use strict";


class MobileadoraClient {
	constructor() {
		this.dynamic;
		this.vertical;
		this.scrollable;
		this.resizeable;
		this.ws;
		this.connected;
		this.root_elem = document.getElementsByTagName('ma-frame')[0];

		this.inputs = [];

		this.dictionary = [
			"text",
			"button",
			"submit",
			"toggle",
			"joystick",
			"generic",
		];

		this.input_counts = new Uint8Array(this.dictionary.length);
	}

	inputCount() {
		return this.inputs.length;
	}

	// uses data from frame to create all inputs, adjust viewport and 
	frameLoad(data) {
		console.log(data);
		// first byte declaring important properties of the frame

		this.dynamic	= ((data[0] >> 3) & 1) > 0 ? true : false;
		this.vertical	= ((data[0] >> 2) & 1) > 0 ? true : false;
		this.scrollable	= ((data[0] >> 1) & 1) > 0 ? true : false;
		this.resizeable	= ((data[0] >> 0) & 1) > 0 ? true : false;

		console.log("type: " + this.dynamic);
		console.log("orientation: " + this.vertical);
		console.log("scrollable: " + this.scrollable);
		console.log("resizeable: " + this.resizeable);

		let input_count = data[1];
		let element_count = data[2];

		console.log("input count: " + input_count);
		console.log("element count: " + element_count);

		// go input by input and add
		let byte = 3;
		for(let i = 0; i < input_count; i++) {
			let type = data[byte];
			let size = new Uint32Array([data[byte + 1], 
										data[byte + 2], 
										data[byte + 3], 
										data[byte + 4]])[0];

			let count = 0;
			// increment the input counts
			if(type > 0 && type < this.input_counts.length) {
				count = this.input_counts[type];
				this.input_counts[type] += 1;
				console.log(this.input_counts);
			}

			// actually add input

			switch(this.dictionary[type]) {
				// TODO: add missing ones
				// TODO: take the "size variable into account
				case "text":
					break;
				case "button":
					new Button(this, type, count, "A");
					break;
				case "submit":
					break;
				case "toggle":
					break;
				case "joystick":
					new Joystick(this, type, count);
					break;
				case "generic":
					break;

				default:
					console.log("invalid type: " + type);
					break;
			}

			byte += 5;
		}
	}

	frameRemove() {
		let root = document.getElementsByTagName('ma-frame')[0];

		while(root.lastChild)
			root.removeChild(root.lastChild);

		for(var i = 0; i < this.input_counts.length; i++)
			this.input_counts[i] = 0;
	}

	connect(ip_address) {
		if(this.connected) {
			this.ws.close();
		}
		this.ws = new WebSocket('ws://' + ip_address);

		// As soon as server connects
		this.ws.onopen = () => {

			console.log('Connected to server!');
			this.connected = true;

			// send message to server
			//websocket.send("Connected!");
		};

		this.ws.onclose = () => {
			console.log('Server closed =(');

			this.connected = false;
			this.frameRemove();
		};

		this.ws.onmessage = async (evt) => {
			evt.data;
			console.log("Received message: " + evt.data);

			let data = new Uint8Array(await evt.data.arrayBuffer());

			console.log(data);

			// read header
			let message_type = (data[0] >> 4) & 4;

			// if message type is frame
			if(message_type == 0) {
				console.log("data[0]: " + data[0]);
				this.frameLoad(data);
			}

			// if message is input request, forcefully send all input data at once
			if(message_type == 1) {
				for(let i = 0; i < this.inputs.length; i++) {
					this.inputs[i].send();
				}
			}
		};
	}
}
