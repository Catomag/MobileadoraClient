"use strict";
var websocket;

// Library stuff

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
	//confirm('evt ' + evt.type);
	//evt.preventDefault();
	
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

	let x, y;
	x = base.offsetLeft + handle.offsetLeft;
	y = base.offsetTop + handle.offsetTop;

	let w, h;
	w = handle.offsetWidth;
	h = handle.offsetHeight;

	let center_x, center_y;
	center_x = base.offsetLeft + (base.offsetWidth / 2) - (w / 2);
	center_y = base.offsetTop  + (base.offsetHeight/ 2) - (h / 2);

	let diff_x, diff_y;
	diff_x = (x - mouse_x) - center_x;
	diff_y = (y - mouse_y) - center_y;

	let dist =  (mouse_x - center_x) * (mouse_x - center_x) +
				(mouse_x - center_y) * (mouse_x - center_y);

	console.log("mouse: " + mouse_x + "," + mouse_y);

	let new_x, new_y;
	new_x = (mouse_x - (w / 2));
	new_y = (mouse_y - (h / 2));


	//if(dist < (base.offsetWidth / 2) * (base.offsetWidth / 2) - (w / 2) * (w / 2)) {
		handle.style.position = "absolute";
		handle.style.left = new_x + "px";
		handle.style.top  = new_y + "px";
//	}
//	else {
//	}

	let yaw = ((new_x - center_x) / base.offsetWidth) * 2;
	let pitch = ((new_y - center_y) / base.offsetHeight) * 2;
	console.log("joystick: " + ((new_x - center_x) / base.offsetWidth) * 2  + ", " + ((new_y - center_y) / base.offsetHeight) * -2);

	let buf = new int8Array(4);

	buf[0] = 4; // input type
	buf[1] = 0; // input index (hard coded)
	buf[2] = Math.round(yaw * 128);
	buf[3] = Math.round(pitch * 128);

	websocket.send(buf);
	evt.preventDefault();
}


function joystickStopDragging(evt) {
	console.log("this ran");
	//evt.preventDefault();
	let handle = evt.source || evt.srcElement;
	let base = handle.parentElement;

	let x, y;
	x = base.offsetLeft + handle.offsetLeft;
	y = base.offsetTop + handle.offsetTop;

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
		websocket.send("Connected!");
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


let loops = 0;
function send_message() {
	websocket.send("Message: " + loops);
	loops++;
}


