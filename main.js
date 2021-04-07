"use strict";
var websocket;
var connected = false;

// Library stuff

function floatToShort(number) {
	return Math.ceil((number * 0xFFFF) / 2);
}
//
//const inputs = Array();
//
//class InputType {
//	constructor(html) {
//		this.id;
//		this.index = inputs.length;
//		this.data;
//
//		this.element = document.createElement('template');
//		this.element.innerHTML = html;
//		//document.getElementsByTagName("body")[0].append(elem);
//
//		//inputs.append(this);
//	}
//
//	getRelativeIndex() {
//	}
//}
//
//var inputTypes = {
//	"text" : new InputType(""),
//	"button" : new InputType(""),
//	"submit" : new InputType(""),
//	"joystick" : new InputType(""),
//};
//
//
//
//function inputSend(id, index, data) {
//	websocket.send();
//}
//
//class Joystick extends Input {
//	constructor() {
//		super();
//	}
//}


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

var joystick_count = 0;
class Joystick {
	constructor(internal_type) {
		this.source = "<div class=\"joystick\"><div class=\"joystick-handle\"></div></div>";

		let div = document.createElement('div');
		div.innerHTML = this.source.trim();

		this.base = document.getElementsByTagName('body')[0].insertAdjacentElement('beforeend', div.firstChild);
		this.handle = this.base.firstChild;

		this.w = this.handle.offsetWidth;
		this.h = this.handle.offsetHeight;

		this.pitch = 0;
		this.yaw = 0;

		this.last_message = new Date();

		this.handle.addEventListener('touchstart', () => {
			this.handle.addEventListener('mouseup', (e) => { this.onStop(this) }, false);
			this.handle.addEventListener('mousemove', (e) => { this.onDrag(this, e) }, false);
			this.handle.addEventListener('touchend', (e) => { this.onStop(this) }, false);
			this.handle.addEventListener('touchmove', (e) => { this.onDrag(this, e) }, false);
		}, false);

		this.handle.addEventListener('mousedown', () => {
			this.handle.onmouseup = (e) => { this.onStop(this); };
			this.handle.onmousemove = (e) => { this.onDrag(this, e); };
			this.handle.addEventListener('touchend', (e) => { this.onStop(this) }, false);
			this.handle.addEventListener('touchmove', (e) => { this.onDrag(this, e) }, false);
		});

		this.internal_type = internal_type;
		this.id = joystick_count;
		joystick_count++;
	}

	onDrag(self, evt) {
		let handle = self.handle;
		let base = self.base;
		let w = self.w;
		let h = self.h;

		let mouse_x, mouse_y;
		if(evt.type == 'touchmove') {
			mouse_x = evt.changedTouches[0].pageX;
			mouse_y = evt.changedTouches[0].pageY;
		}
		else {
			mouse_x = evt.x;
			mouse_y = evt.y;
		}

		let center_x, center_y;
		center_x = base.offsetLeft + (base.offsetWidth / 2) - (w / 2);
		center_y = base.offsetTop  + (base.offsetHeight/ 2) - (h / 2);

		let dir_x, dir_y;
		dir_x = mouse_x - center_x - (w / 2);
		dir_y = mouse_y - center_y - (h / 2);

		let angle = Math.atan2(dir_x, dir_y);

		let dist = dir_x * dir_x + dir_y * dir_y;
		let max_dist = ((base.offsetWidth / 2) * (base.offsetWidth / 2) + (base.offsetHeight / 2) * (base.offsetHeight / 2)) - ((w / 2) * (w / 2) + (h / 2) * (h / 2));

		let mag = Math.sqrt(Math.min(max_dist, dist));

		self.yaw = Math.sin(angle);
		self.pitch = Math.cos(angle);

		let new_x, new_y;
		new_x = self.yaw * mag;
		new_y = self.pitch * mag;

		handle.style.position = "absolute";
		handle.style.left = (center_x + new_x) + "px";
		handle.style.top  = (center_y + new_y) + "px";

		// only send message if 10ms have ellapsed
		if(connected && 10 < (new Date() - self.last_message)) {
			// send movement info to websocket server
			let floatArray = new Float32Array(2);
			floatArray[0] =  self.yaw;
			floatArray[1] = -self.pitch;

			let head = new Uint8Array(2);

			head[0] = self.internal_type; // input type
			head[1] = self.id; // input index (hard coded)

			let buf = new Blob([head, floatArray]);

//			let yaw_binary = floatToShort(self.yaw);
//			buf[2] = (yaw_binary >> 8) & 255;
//			buf[3] = (yaw_binary >> 0) & 255;
//
//			let pitch_binary = -floatToShort(self.pitch);
//			buf[4] = (pitch_binary >> 8) & 255;
//			buf[5] = (pitch_binary >> 0) & 255;

			websocket.send(buf);
			self.last_message = new Date();
		}

		evt.preventDefault();
	}

	onStop(self) {
		self.handle.style.position = "relative";
		self.handle.style.left = (self.base.offsetWidth/2 - self.w/2) + "px";
		self.handle.style.top  = (self.base.offsetHeight/2 - self.h/2) + "px";

		self.pitch = 0;
		self.yaw = 0;

		self.handle.onmouseup = null;
		self.handle.onmousemove = null;
		self.handle.ontouchcancel = null;
		self.handle.ontouchend = null;
		self.handle.ontouchmove = null;

		let floatArray = new Float32Array(2);
		floatArray[0] = 0;
		floatArray[1] = 0;

		let head = new Uint8Array(2);
		head[0] = self.internal_type;
		head[1] = self.id;

		let buf = new Blob([head, floatArray]);

		if(connected)
			websocket.send(buf);
	}
}


var button_count = 0;
class Button {
	constructor(internal_type, char) {
		this.source = "<div class=\"button\">" + char + "</div>";

		let div = document.createElement('div');
		div.innerHTML = this.source.trim();

		this.base = document.getElementsByTagName('body')[0].insertAdjacentElement('beforeend', div.firstChild);

		this.base.addEventListener('touchstart', () => { this.onClick(this); }, false);
		this.base.addEventListener('mousedown', () => { this.onClick(this); }, false);
		this.base.addEventListener('touchend', () => { this.onRelease(this); }, false);
		this.base.addEventListener('mouseup', () => { this.onRelease(this); }, false);

		this.internal_type = internal_type;
		this.id = button_count;
		button_count++;
	}

	onClick(self) {
		let buf = new Uint8Array(2 + 1);
		buf[0] = self.internal_type;
		buf[1] = self.id;
		buf[2] = 1;
		if(connected)
			websocket.send(buf);
	}

	onRelease() {
		let buf = new Uint8Array(2 + 1);
		buf[0] = self.internal_type;
		buf[1] = self.id;
		buf[2] = 0;
		if(connected)
			websocket.send(buf);
	}
}


function connect_to_server(ip_address, port) {
//	document.window.onbeforeunload = () => {
//		websocket.close();
//	}
	websocket = new WebSocket("ws://" + ip_address + ":" + port);


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
		//confirm("Received message: " + evt.data);
		console.log("Received message: " + evt.data);
	};
}


let loops = 0;
function send_message() {
	//websocket.send("Message: " + loops);
	loops++;
}


