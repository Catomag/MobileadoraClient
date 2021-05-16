// IMPORTANT, THIS MUST MATCH THE SERVER"S DICTOINARY

class Input {
	constructor(ma, id, index) {
		this.id = id;
		this.index = index;
		this.data;
		this.ma = ma;
	}

	send() {
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
	constructor(ma, id, index) {
		super(ma, id, index);

		this.source = "<ma-joystick><ma-joystick-handle></ma-joystick-handle></ma-joystick>";

		let div = document.createElement('div');
		div.innerHTML = this.source.trim();

		this.base = this.ma.root_elem.insertAdjacentElement('beforeend', div.firstChild);
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
	constructor(ma, id, index, char) {
		super(ma, id, index);

		this.source = "<ma-button>" + char + "</ma-button>";

		let div = document.createElement('div');
		div.innerHTML = this.source.trim();

		this.base = this.ma.root_elem.insertAdjacentElement('beforeend', div.firstChild);

		this.base.addEventListener('touchstart', () => { this.onClick(); }, false);
		this.base.addEventListener('mousedown', () => { this.onClick(); }, false);
		this.base.addEventListener('touchend', () => { this.onRelease(); }, false);
		this.base.addEventListener('mouseup', () => { this.onRelease(); }, false);

		this.data = new Uint8Array(1);

		this.pressed = false;
	}

	onClick() {
		this.pressed = true;

		this.data[0] = 1;
		this.send();
	}

	onRelease() {
		this.pressed = false;

		this.data[0] = 0;
		this.send();
	}
}
