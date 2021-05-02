// IMPORTANT, THIS MUST MATCH THE SERVER"S DICTOINARY
var input_dictionary = [
	"text",
	"button",
	"submit",
	"toggle",
	"joystick",
	"generic",
];


class Input {
	constructor(id, index) {
		this.id = this.id;
		this.index = this.index;
		this.data = NULL;
	}

	send() {
		if(connected) {
			let header = new Uint8Array(2);

			header[0] = this.id;
			header[1] = this.index;

			let buf = new Blob([head, this.data]);

			websocket.send(buf);
		}
	}
}


class Joystick extends Input {
	constructor(id, index) {
		super(id, index);

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
			this.handle.addEventListener('mouseup', (e) => { this.onStop() }, false);
			this.handle.addEventListener('mousemove', (e) => { this.onDrag(e) }, false);
			this.handle.addEventListener('touchend', (e) => { this.onStop() }, false);
			this.handle.addEventListener('touchmove', (e) => { this.onDrag(e) }, false);
		}, false);

		this.handle.addEventListener('mousedown', () => {
			this.handle.onmouseup = (e) => { this.onStop(); };
			this.handle.onmousemove = (e) => { this.onDrag(e); };
			this.handle.addEventListener('touchend', (e) => { this.onStop() }, false);
			this.handle.addEventListener('touchmove', (e) => { this.onDrag(e) }, false);
		});

		this.internal_type = internal_type;
		this.id = joystick_count;
		joystick_count++;
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
		if(connected && 10 < (new Date() - this.last_message)) {
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


var button_count = 0;
class Button extends Input {
	constructor(internal_type, char) {
		super();

		this.source = "<div class=\"button\">" + char + "</div>";

		let div = document.createElement('div');
		div.innerHTML = this.source.trim();

		this.base = document.getElementsByTagName('body')[0].insertAdjacentElement('beforeend', div.firstChild);

		this.base.addEventListener('touchstart', () => { this.onClick(); }, false);
		this.base.addEventListener('mousedown', () => { this.onClick(); }, false);
		this.base.addEventListener('touchend', () => { this.onRelease(); }, false);
		this.base.addEventListener('mouseup', () => { this.onRelease(); }, false);

		this.internal_type = internal_type;
		console.log(internal_type);
		console.log(this.internal_type);
		this.id = button_count;

		this.pressed = false;
		button_count++;
	}

	onClick() {
		this.pressed = true;

		this.data = 1;
		this.send();
	}

	onRelease() {
		this.pressed = false;

		this.data = 0;
		this.send(0);
	}
}
