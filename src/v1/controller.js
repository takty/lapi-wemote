/**
 * Controller - Wemote
 * @author Takuto Yanagida
 * @version 2020-04-27
 */


document.addEventListener('DOMContentLoaded', () => {

	const ROOMID_PREFIX = 'wemote-';

	const MSG_EXPIRATION = 'Your session has expired.\n';
	const MSG_PER_ORI    = 'Requesting permission of device orientation sensor...\n';
	const MSG_PER_MOT    = 'Requesting permission of device motion sensor...\n';
	const MSG_OK         = 'OK!\n';
	const MSG_REJECTED   = 'Rejected!\n';

	const href = location.href;
	const pidx = href.indexOf('?');
	const hash = pidx === -1 ? '' : href.substring(pidx + 1);
	const date = pidx === -1 ? '' : href.substring(href.length - 8);

	const roomId = ROOMID_PREFIX + hash;

	const state    = document.getElementById('state');
	const output   = document.getElementById('output');
	const btnStart = document.getElementById('btn-start');
	const btnStop  = document.getElementById('btn-stop');

	btnStart.addEventListener('click', start);
	btnStop.addEventListener('click', stop);

	const metOriX = document.getElementById('ori-x');
	const metOriY = document.getElementById('ori-y');
	const metOriZ = document.getElementById('ori-z');

	const metAccX = document.getElementById('acc-x');
	const metAccY = document.getElementById('acc-y');
	const metAccZ = document.getElementById('acc-z');

	const metAcgX = document.getElementById('acg-x');
	const metAcgY = document.getElementById('acg-y');
	const metAcgZ = document.getElementById('acg-z');

	const metRotX = document.getElementById('rot-x');
	const metRotY = document.getElementById('rot-y');
	const metRotZ = document.getElementById('rot-z');

	let con        = null;
	let isStarting = false;
	let isExpired  = false;
	let isFirst    = true;

	const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
	if (date !== today) {
		state.style.backgroundColor = 'rgba(170, 0, 0, 0.5)';
		isExpired = true;
		output.value = MSG_EXPIRATION;
	}

	async function start() {
		turnOn();
		if (!isExpired) {
			if (con) stop();
			con = new WEMOTE.Connection(roomId, null, onStateChange);
			setTimeout(() => { con.start(); }, 10);
		}
	}

	function stop() {
		turnOff();
		if (!isExpired) {
			if (!con) return;
			con.stop();
			con = null;
		}
	}

	function onStateChange(msg, e) {
		output.value = output.value + msg + '\n';
		if (msg === 'open') {
			state.style.backgroundColor = 'rgba(0, 170, 0, 0.25)';
		} else if (msg === 'connect') {
			state.style.backgroundColor = 'rgba(0, 170, 0, 0.75)';
		} else if (msg === 'disconnect') {
			state.style.backgroundColor = '';
			turnOff();
		}
	}

	function turnOn() {
		btnStart.disabled = true;
		btnStop.disabled  = false;
		isStarting        = true;
		output.value      = isExpired ? MSG_EXPIRATION : '';

		if (isFirst) {
			setEventListener();
			isFirst = false;
		}
	}

	function turnOff() {
		btnStart.disabled = false;
		btnStop.disabled  = true;
		isStarting        = false;
		output.value      = isExpired ? MSG_EXPIRATION : '';
		clearMeter();
	}

	function send(data) {
		if (con) con.send(data);
	}


	// -------------------------------------------------------------------------


	async function setEventListener() {
		await setOrientationEventListener();
		await setMotionEventListener();
	}

	async function setOrientationEventListener() {
		if (DeviceOrientationEvent.requestPermission) {
			output.value = output.value + MSG_PER_ORI;
			const res = await DeviceOrientationEvent.requestPermission().catch((e) => {
				output.value = output.value + MSG_REJECTED;
				output.value = output.value + e.toString() + '\n';
				console.log(e);
			});
			if (res === 'granted') {
				output.value = output.value + MSG_OK;
				window.addEventListener('deviceorientation', onDeviceOrientation, true);
			}
		} else {
			window.addEventListener('deviceorientation', onDeviceOrientation, true);
		}
	}

	async function setMotionEventListener() {
		if (DeviceMotionEvent.requestPermission) {
			output.value = output.value + MSG_PER_MOT;
			const res = await DeviceMotionEvent.requestPermission().catch((e) => {
				output.value = output.value + MSG_REJECTED;
				output.value = output.value + e.toString() + '\n';
				console.log(e);
			});
			if (res === 'granted') {
				output.value = output.value + MSG_OK;
				window.addEventListener('devicemotion', onDeviceMotion, true);
			}
		} else {
			window.addEventListener('devicemotion', onDeviceMotion, true);
		}
	}

	function onDeviceOrientation(e) {
		if (!isStarting) return;
		const ds = {
			x: Math.round(e.beta),  // -180 - 180 [deg]
			y: Math.round(e.gamma), //  -90 -  90
			z: Math.round(e.alpha)  //    0 - 360
		};
		send(JSON.stringify({ orientation: ds }));

		setMeter(metOriX, ds.x, -180, 180);
		setMeter(metOriY, ds.y,  -90,  90);
		setMeter(metOriZ, ds.z,    0, 360);
	}

	function onDeviceMotion(e) {
		if (!isStarting) return;
		const as = {
			x: Math.round(e.acceleration.x * 100) / 100,  // [m/s2]
			y: Math.round(e.acceleration.y * 100) / 100,
			z: Math.round(e.acceleration.z * 100) / 100
		};
		const ags = {
			x: Math.round(e.accelerationIncludingGravity.x * 100) / 100,  // [m/s2]
			y: Math.round(e.accelerationIncludingGravity.y * 100) / 100,
			z: Math.round(e.accelerationIncludingGravity.z * 100) / 100
		};
		const rrs = {
			x: Math.round(e.rotationRate.beta),  // -360 - 360 [deg]
			y: Math.round(e.rotationRate.gamma), // -360 - 360
			z: Math.round(e.rotationRate.alpha)  // -360 - 360
		};
		send(JSON.stringify({ acceleration: as, acceleration_gravity: ags, rotation: rrs }));

		setMeter(metAccX, as.x, -50, 50);
		setMeter(metAccY, as.y, -50, 50);
		setMeter(metAccZ, as.z, -50, 50);

		setMeter(metAcgX, ags.x, -50, 50);
		setMeter(metAcgY, ags.y, -50, 50);
		setMeter(metAcgZ, ags.z, -50, 50);

		setMeter(metRotX, rrs.x, -360, 360);
		setMeter(metRotY, rrs.y, -360, 360);
		setMeter(metRotZ, rrs.z, -360, 360);
	}

	function clearMeter() {
		setMeter(metOriX, 0, -180, 180);
		setMeter(metOriY, 0,  -90,  90);
		setMeter(metOriZ, 0,    0, 360);

		setMeter(metAccX, 0, -50, 50);
		setMeter(metAccY, 0, -50, 50);
		setMeter(metAccZ, 0, -50, 50);

		setMeter(metAcgX, 0, -50, 50);
		setMeter(metAcgY, 0, -50, 50);
		setMeter(metAcgZ, 0, -50, 50);

		setMeter(metRotX, 0, -360, 360);
		setMeter(metRotY, 0, -360, 360);
		setMeter(metRotZ, 0, -360, 360);
	}

	function setMeter(elm, val, min, max) {
		if (min === 0) {
			elm.style.left  = '0';
			elm.style.right = ((max - val) / max * 100) + '%';
		} else {
			if (val < 0) {
				elm.style.left  = ((val - min) / -min * 50) + '%';
				elm.style.right = '50%';
			} else {
				elm.style.left  = '50%';
				elm.style.right = ((max - val) / max * 50) + '%';
			}
		}
	}

});
