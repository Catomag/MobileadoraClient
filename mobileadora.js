"use strict";

let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

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

		this.input_dictionary = [
			"text",
			"button",
			"submit",
			"toggle",
			"joystick",
			"generic",
		];

		this.element_dictionary = [
			"text",
			"break",
			"spacer",
			"h1",
			"h2",
			"h3",
			"line",
			"color",
		];

		this.input_counts = new Uint8Array(this.input_dictionary.length);
		this.element_counts = new Uint8Array(this.element_dictionary.length);
	}

	setRoot(element) {
		if(element.nodeType && element !== "undefined") {
			this.root_elem = element;
		}
		else
			console.error("attempted to set a non element as root element");
	}

	inputCount() {
		return this.inputs.length;
	}

	addElement(source) {
		let div = document.createElement('div');
		div.innerHTML = source.trim();

		let elem = this.root_elem.insertAdjacentElement('beforeend', div.firstChild);

		elem.classList.add("ma-item");

		return elem;
	}

	// uses data from frame to create all inputs, adjust viewport and 
	async frameLoad(data) {
		console.log(data);
		// first byte declaring important properties of the frame

		this.dynamic	= ((data[0] >> 3) & 1) > 0 ? true : false;
		this.vertical	= ((data[0] >> 2) & 1) > 0 ? true : false;
		this.scrollable	= ((data[0] >> 1) & 1) > 0 ? true : false;
		this.resizeable	= ((data[0] >> 0) & 1) > 0 ? true : false;

		let input_count = data[1];
		let element_count = data[2];

		// go item by item
		let byte = 3;
		let inputs_added = 0;
		let elements_added = 0;

		while((inputs_added < input_count || elements_added < element_count) && byte < data.length) {
			let isInput = !(data[byte] & 0x80) == 0 ? false : true;
			let type = data[byte] & 0x7f; // ignore most significant bit

			// there is litterally no better way to convert 4 bytes into a 32 byte number in js
			let size_byte1 = data[byte + 1];
			let size_byte2 = data[byte + 2];
			let size_byte3 = data[byte + 3];
			let size_byte4 = data[byte + 4];

			let size = 0;
			size |= size_byte4 << 24;
			size |= size_byte3 << 16;
			size |= size_byte2 << 8;
			size |= size_byte1;

			let count = 0;
			// increment the input counts
			if(isInput) {
				if(type > 0 && type < this.input_counts.length) {
					count = this.input_counts[type];
					this.input_counts[type] += 1;
				}
			}
			else {
				if(type > 0 && type < this.element_counts.length) {
					count = this.element_counts[type];
					this.element_counts[type] += 1;
				}
			}	

			byte = byte + 5;

			// actually add item
			if(isInput) {
				let input;

				switch(this.input_dictionary[type]) {
					case "text":
						input = new Text(this, type, count, size);
						break;

					case "button":
						input = new Button(this, type, count, size, alphabet[count % 25]);
						break;

					case "submit":
						input = new SubmitButton(this, type, count, size, "Submit");
						break;
						
					case "toggle":
						input = new Toggle(this, type, count, size);
						break;

					case "joystick":
						input = new Joystick(this, type, count, size);
						break;

					case "generic":
						break;

					default:
						console.error("invalid type: " + type);
						break;
				}

				// using the power of OOP
				this.inputs.push(input);
				inputs_added = inputs_added + 1;
			}
			else {
				let string = "";
				switch(this.element_dictionary[type]) {
					case "color":
						this.addElement("<ma-color style='background-color: rgb(" 
										+ data[byte] + "," + data[byte + 1] + "," + data[byte + 2] + 
										")'></ma-color>");
						break;

					case "text":
						string = "";
						for(let i = 0; i < size; i++)
							string += String.fromCharCode(data[byte + i]);

						this.addElement("<p>" + string + "</p>");
						break;

					case "break":
						this.addElement("<ma-br>");
						break;

					case "spacer":
						this.addElement("<ma-spacer></ma-spacer>");
						break;

					case "h1":
						string = "";
						for(let i = 0; i < size; i++)
							string += String.fromCharCode(data[byte + i]);

						this.addElement("<h1>" + string + "</h1>");
						break;

					case "h2":
						string = ""; // don't need to redeclare the variable because javascript
						for(let i = 0; i < size; i++)
							string += String.fromCharCode(data[byte + i]);

						this.addElement("<h2>" + string + "</h2>");
						break;

					case "h3":
						string = "";
						for(let i = 0; i < size; i++)
							string += String.fromCharCode(data[byte + i]);

						this.addElement("<h3>" + string + "</h3>");
						break;

					default:
						console.error("invalid type: " + type);
						break;
				}

				elements_added = elements_added + 1;
				byte = byte + size;
			}
		}
	}

	frameRemove() {
		let root = this.root_elem;

		while(root.lastChild)
			root.removeChild(root.lastChild);

		for(var i = 0; i < this.input_counts.length; i++)
			this.input_counts[i] = 0;

		for(var i = 0; i < this.element_counts.length; i++)
			this.element_counts[i] = 0;

		// clear the inputs array
		this.inputs = [];
	}

	sendAll() {
		// input can only be sent if ma is dynamic, so dynamic is set to true all the info is sent and then it is quickly turned off
		let dynamic = this.dynamic;
		this.dynamic = true;

		for(let i = 0; i < this.inputs.length; i++) {
			this.inputs[i].send();
		}

		this.dynamic = dynamic;
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
		};

		this.ws.onclose = () => {
			console.log('Server closed =(');

			this.connected = false;
			this.frameRemove();
		};

		this.ws.onmessage = async (evt) => {
			evt.data;

			let i_love_async_functions = (blobs_were_a_masterful_invention) => {
				return new Promise((resolve, reject) => {
					let stupid_js_bs = new FileReader(); // intrinsic documentation
					stupid_js_bs.onload = function are_you_fucking_serious_right_now() {
						resolve(stupid_js_bs.result);
					};

					stupid_js_bs.onerror = (error) => reject(error);

					stupid_js_bs.readAsArrayBuffer(blobs_were_a_masterful_invention);
				});
			};

			let data = new Uint8Array(await i_love_async_functions(evt.data));
			console.log("the dark times are behind us");

			// read header
			let message_type = (data[0] >> 4) & 15;

			// if message type is frame
			if(message_type == 0) {
				// get rid of current frame before proceeding
				this.frameRemove();

				console.log("received frame");
				this.frameLoad(data);
			}

			// if message is input request, forcefully send all input data at once
			else if(message_type == 1) {
				console.log("received fetch request");

				this.sendAll();
			}
		};
	}
}




// IMPORTANT, THIS MUST MATCH THE SERVER"S DICTOINARY

// Base input class
class Input {
	constructor(ma, id, index, size) {
		this.id = id;
		this.index = index;
		this.data;
		this.size = size;
		this.ma = ma;
	}

	send() {
		// only send message if frame is dynamic and frame is 
		if(this.ma.connected && this.ma.dynamic) {
			let header = new Uint8Array(2);

			header[0] = this.id;
			header[1] = this.index;

			let buf = new Blob([header, this.data]);
			console.log("message sent");

			this.ma.ws.send(buf);
		}
	}
}


class Joystick extends Input {
	constructor(ma, id, index, size) {
		super(ma, id, index, size);

		this.source = "<ma-joystick><ma-joystick-handle></ma-joystick-handle></ma-joystick>";

		this.base = this.ma.addElement(this.source);
		this.handle = this.base.firstChild;

		this.w = this.handle.offsetWidth;
		this.h = this.handle.offsetHeight;

		this.pitch = 0;
		this.yaw = 0;

		this.last_message = new Date();

		this.handle.addEventListener('touchstart', () => {
			this.handle.addEventListener('mouseup',	() => { this.onStop() }, false);
			this.handle.addEventListener('mousemove', (e) => { this.onDrag(e) }, false);
			this.handle.addEventListener('touchend', () => { this.onStop() }, false);
			this.handle.addEventListener('touchmove', (e) => { this.onDrag(e) }, false);
		}, false);

		this.handle.addEventListener('mousedown', () => {
			this.handle.onmouseup = (e) => { this.onStop(); };
			this.handle.onmousemove = (e) => { this.onDrag(e); };
			this.handle.addEventListener('touchend', () => { this.onStop() }, false);
			this.handle.addEventListener('touchmove', (e) => { this.onDrag(e) }, false);
		});
	}

	onDrag(evt) {
		let handle = this.handle;
		let base = this.base;
		let w = this.w;
		let h = this.h;

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

		this.yaw = Math.sin(angle);
		this.pitch = Math.cos(angle);

		let new_x, new_y;
		new_x = this.yaw * mag;
		new_y = this.pitch * mag;

		handle.style.position = "absolute";
		handle.style.left = (center_x + new_x) + "px";
		handle.style.top  = (center_y + new_y) + "px";

		// only send message if 10ms have ellapsed
		if(this.ma.connected && 10 < (new Date() - this.last_message)) {
			// send movement info to websocket server
			let floatArray = new Float32Array(2);
			floatArray[0] =  this.yaw;
			floatArray[1] = -this.pitch;

			this.data = floatArray;
			this.send();
			this.last_message = new Date();
		}

		evt.preventDefault();
	}

	onStop() {
		this.handle.style.position = "relative";
		this.handle.style.left = (this.base.offsetWidth/2 - this.w/2) + "px";
		this.handle.style.top  = (this.base.offsetHeight/2 - this.h/2) + "px";

		this.pitch = 0;
		this.yaw = 0;

		this.handle.onmouseup = null;
		this.handle.onmousemove = null;
		this.handle.ontouchcancel = null;
		this.handle.ontouchend = null;
		this.handle.ontouchmove = null;

		let floatArray = new Float32Array(2);
		floatArray[0] = 0;
		floatArray[1] = 0;

		this.data = floatArray;
		this.send();
	}
}


class Button extends Input {
	constructor(ma, id, index, size, char) {
		super(ma, id, index, size);

		this.source = "<ma-button>" + char + "</ma-button>";

		this.base = this.ma.addElement(this.source);

		this.base.addEventListener('touchstart', () => { this.onClick(); }, false);
		this.base.addEventListener('mousedown', () => { this.onClick(); }, false);
		this.base.addEventListener('touchend', () => { this.onRelease(); }, false);
		this.base.addEventListener('mouseup', () => { this.onRelease(); }, false);

		this.data = new Uint8Array(1);

		this.pressed = false;
	}

	onClick() {
		this.base.classList.add('active');
		this.pressed = true;

		this.data[0] = 1;
		this.send();
	}

	onRelease() {
		this.base.classList.remove('active');
		this.pressed = false;

		this.data[0] = 0;
		this.send();
	}
}

class SubmitButton extends Input {
	constructor(ma, id, index, size, text) {
		super(ma, id, index, size);

		this.source = "<ma-button-submit>" + text + "</ma-button-submit>";

		this.base = this.ma.addElement(this.source);

		this.base.addEventListener('touchstart', () => { this.onClick(); }, false);
		this.base.addEventListener('mousedown', () => { this.onClick(); }, false);
		this.base.addEventListener('touchend', () => { this.onRelease(); }, false);
		this.base.addEventListener('mouseup', () => { this.onRelease(); }, false);

		this.data = new Uint8Array(1);

		this.pressed = false;
	}

	onClick() {
		this.base.classList.add('active');
		this.pressed = true;

		this.data[0] = 1;
		this.ma.sendAll();
	}

	onRelease() {
		this.base.classList.remove('active');
		this.pressed = false;

		this.data[0] = 0;
	}
}

class Toggle extends Input {
	constructor(ma, id, index, size) {
		super(ma, id, index, size);

		this.source = "<ma-toggle>" + '✓' + "</ma-toggle>";

		this.base = this.ma.addElement(this.source);

		this.base.addEventListener('touchstart', () => { this.onClick(); }, false);
		this.base.addEventListener('mousedown', () => { this.onClick(); }, false);

		this.data = new Uint8Array(1);

		this.value = false;
	}

	onClick() {
		this.value = !this.value;

		if(this.value)
			this.base.classList.add('active');
		else
			this.base.classList.remove('active');

		// javascript can't convert booleans to integers because it is a very picturesque language
		this.data[0] = this.value ? 1 : 0;
		this.send();
	}
}

class Text extends Input {
	constructor(ma, id, index, size) {
		super(ma, id, index, size);

		this.source = "<ma-text><span contenteditable='true'></span></ma-text>";

		this.base = this.ma.addElement(this.source);
		this.text_elem = this.base.firstChild;

		this.text_elem.addEventListener('input', (e) => { this.onInput(e); }, false);
		this.text_elem.addEventListener('keydown', (e) => { this.onKeyPressed(e); }, false);
		this.text_elem.addEventListener('keyup', (e) => { this.onRelease(e); }, false);

		this.data = new Uint8Array(size);
		this.current = 0;
		this.text_size = this.size - 1;
		console.log("text size: " + this.text_size);
	}

	isKeyCharacter(k) {
		// courtesy of absolute chad over at stack overflow
		// stackoverflow.com/questions/7770561/reject-control-keys-on-keydown-event
		if(	   k == 20 /* Caps lock */
			|| k == 16 /* Shift */
			|| k == 8 /* Backspace */
			|| k == 9 /* Tab */
			|| k == 27 /* Escape Key */
			|| k == 17 /* Control Key */
			|| k == 91 /* Windows Command Key */
			|| k == 19 /* Pause Break */
			|| k == 18 /* Alt Key */
			|| k == 93 /* Right Click Point Key */
			|| ( k >= 35 && k <= 40 ) /* Home, End, Arrow Keys */
			|| k == 45 /* Insert Key */
			|| ( k >= 33 && k <= 34 ) /*Page Down, Page Up */
			|| (k >= 112 && k <= 123) /* F1 - F12 */
			|| (k >= 144 && k <= 145 )) {
			return false;	
		}
		else {
			return true;
		}
	}

	onInput(e) {
		let str = this.text_elem.innerText.slice();

		str = str.replaceAll('\u00a0', ' '); // get rid of &nbsp; (a dumb thing i shouldn't need to be doing)
		if(e.isComposing)
			str += e.key;

		console.log(str);

		if(str.length <= this.text_size) {
			let last = -1; // if length is 0, then terminating character is at index 0 

			for(var i = 0; i < this.size && i < str.length; i++) {
				this.data[i] = str[i].charCodeAt(0);

				last = i;
			}

			this.data[last + 1] = 0; // terminating characer
			this.send();
		}
	}

	onKeyPressed(e) {
		let str = this.text_elem.innerText.slice();

		if(str.length >= this.text_size && this.isKeyCharacter(e.keyCode)) {
			e.preventDefault();
		}
	}

	onRelease(e) {
		let str = this.base.innerHTML.slice();
		if(str.length >= this.text_size) {
			e.preventDefault();
		}
	}
}

