"use strict";
var websocket;

// Library stuff

function floatToShort(number) {
	return Math.ceil((number * 0xFFFF) / 2);
}

const inputs = Array();

class InputType {
	constructor(html) {
		this.id;
		this.index = inputs.length;
		this.data;

		this.element = document.createElement('template');
		this.element.innerHTML = html;
		document.getElementsByTagName("body")[0].append(elem);

		//inputs.append(this);
	}

	getRelativeIndex() {
	}
}

var inputTypes = {
	"text" : new InputType(""),
	"button" : new InputType(""),
	"submit" : new InputType(""),
	"joystick" : new InputType(""),
};



function inputSend(id, index, data) {
	websocket.send();
}

class Joystick extends Input {
	constructor() {
		super();
	}
}


function inputSend(id, index, data) {

//	let count;
//	for(let i = 0; i < inputs.length; i++) {
//		let data = new Uint8Array(+ data.length);
//		let input = inputData[i].;
//
//
//	}
//	inputs.clear();
}


function joystickDrag(evt) {
	let handle = evt.source || evt.srcElement;
	let base = handle.parentElement;


	let mouse_x, mouse_y;
	if(evt.type == 'touchmove') {
		mouse_x = evt.changedTouches[0].pageX;
		mouse_y = evt.changedTouches[0].pageY;
	}
	else {
		mouse_x = evt.x;
		mouse_y = evt.y;
	}

	let w, h;
	w = handle.offsetWidth;
	h = handle.offsetHeight;

	let center_x, center_y;
	center_x = base.offsetLeft + (base.offsetWidth / 2) - (w / 2);
	center_y = base.offsetTop  + (base.offsetHeight/ 2) - (h / 2);

	let dir_x, dir_y;
	dir_x = mouse_x - center_x - (w / 2);
	dir_y = mouse_y - center_y - (h / 2);

	let angle = Math.atan2(dir_x, dir_y);


	let dist = dir_x * dir_x + dir_y * dir_y;
	let max_dist = ((base.offsetWidth / 2) * (base.offsetWidth / 2) + (base.offsetHeight / 2) * (base.offsetHeight / 2)) / 2;

	let mag = Math.sqrt(Math.min(max_dist, dist));

	let yaw, pitch;
	yaw = Math.sin(angle);
    pitch = Math.cos(angle);

	let new_x, new_y;
	new_x = yaw * mag;
	new_y = pitch * mag;

	console.log("center: " + new_x + ", " + new_y);
	console.log("mag: " + mag + "\n\n\n\n");
	
	handle.style.position = "relative";
	handle.style.left = new_x + "px";
	handle.style.top  = new_y + "px";


	// send movement info to websocket server
	let buf = new Uint8Array(2 + 2 + 2);

	buf[0] = 4; // input type
	buf[1] = 0; // input index (hard coded)

	let yaw_binary = floatToShort(yaw);
//	console.log("uint yaw: " + yaw_binary);
	buf[2] = (yaw_binary >> 8) & 255;
	buf[3] = (yaw_binary >> 0) & 255;

	let pitch_binary = floatToShort(pitch);
//	console.log("uint pitch: " + pitch_binary);
	buf[4] = (pitch_binary >> 8) & 255;
	buf[5] = (pitch_binary >> 0) & 255;

	websocket.send(buf);
	evt.preventDefault();
}


function joystickStopDragging(evt) {
	//evt.preventDefault();
	let handle = evt.source || evt.srcElement;
	let base = handle.parentElement;

	let w, h;
	w = handle.offsetWidth;
	h = handle.offsetHeight;

	let center_x, center_y;
	center_x = base.offsetLeft + (base.offsetWidth / 2) - (w / 2);
	center_y = base.offsetTop  + (base.offsetHeight/ 2) - (h / 2);

	handle.style.position = "absolute";
	handle.style.left = center_x + "px";
	handle.style.top  = center_y + "px";

	handle.onmouseup = null;
	handle.onmousemove = null;

	handle.ontouchcancel = null;
	handle.ontouchmove = null;

	let buf = new Uint8Array(4);

	buf[0] = 4; // input type
	buf[1] = 0; // input index (hard coded)
	buf[2] = 0;
	buf[3] = 0;
	websocket.send(buf);
}

function joystickStartDragging(evt) {
	let source = evt.target || evt.srcElement;

	source.onmouseup = joystickStopDragging;
	source.onmousemove = joystickDrag;

	source.addEventListener('touchend', joystickStopDragging, false);
	source.addEventListener('touchmove', joystickDrag, false);
}



function connect_to_server(ip_address, port) {
//	document.window.onbeforeunload = () => {
//		websocket.close();
//	}
	websocket = new WebSocket("ws://" + ip_address + ":" + port);


	// As soon as server connects
	websocket.onopen = () => {
		console.log("Socket connected!");

		// send message to server
		//websocket.send("Connected!");
	};

	websocket.onclose = () => {
		//confirm("Socket closed =(");
		console.log("Socket closed =(");
	};

	websocket.onmessage = (evt) => {
		evt.data;
		confirm("Received message: " + evt.data);
		console.log("Received message: " + evt.data);
	};
}


let loops = 0;
function send_message() {
	//websocket.send("Message: " + loops);
	loops++;
}


