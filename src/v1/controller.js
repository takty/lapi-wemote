/**
 * Controller - Wemote
 * @author Takuto Yanagida
 * @version 2020-04-25
 */


document.addEventListener('DOMContentLoaded', () => {

	const ROOMID_PREFIX = 'wemote-';

	const href = location.href;
	const pidx = href.indexOf('?');
	const hash = pidx !== -1 ? href.substring(pidx + 1) : '';
	const date = pidx !== -1 ? href.substring(href.length - 8) : '';

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

	let con = null;
	let starting = false;
	let expired = false;

	if (date !== getToday()) {
		state.style.backgroundColor = 'rgba(170, 0, 0, 0.5)';
		expired = true;
	}

	async function start() {
		btnStart.disabled = true;
		btnStop.disabled  = false;
		starting = true;
		output.value = '';
		await setEventListener();

		if (expired) return;
		if (con) stop();
		con = new WEMOTE.Connection(roomId, null/*onMessage*/, onStateChange);
		setTimeout(() => { con.start(); }, 10);
	}

	function stop() {
		if (!con) return;
		con.stop();
		con = null;
	}

	function send(data) {
		if (!con) return;
		con.send(data);
	}

	function onStateChange(msg, e) {
		output.value = output.value + msg + '\n';
		if (msg === 'connect') {
			state.style.backgroundColor = 'rgba(0, 170, 0, 0.5)';
		}
		if (msg === 'disconnect') {
			state.style.backgroundColor = '';
			btnStart.disabled = false;
			btnStop.disabled  = true;
			starting = false;
			clearMeter();
		}
	}

	function getToday() {
		return new Date().toISOString().split('T')[0].replace(/-/g, '');
	}


	// -------------------------------------------------------------------------


	async function setEventListener() {
		await setOrientationEventListener();
		await setMotionEventListener();
	}

	async function setOrientationEventListener() {
		if (DeviceOrientationEvent.requestPermission) {
			output.value = output.value + 'request permission of device orientation sensor\n';
			const res = await DeviceOrientationEvent.requestPermission().catch((e) => {
				console.log(e);
				output.value = output.value + 'Cannot use device orientation sensor\n';
				output.value = output.value + e.toString() + '\n';
			});
			if (res === 'granted') {
				output.value = output.value + 'Can use device orientation sensor\n';
				window.addEventListener('deviceorientation', onDeviceOrientation, true);
			}
		} else {
			window.addEventListener('deviceorientation', onDeviceOrientation, true);
		}
	}

	async function setMotionEventListener() {
		if (DeviceMotionEvent.requestPermission) {
			output.value = output.value + 'request permission of device motion sensor\n';
			const res = await DeviceMotionEvent.requestPermission().catch((e) => {
				console.log(e);
				output.value = output.value + 'Cannot use device motion sensor\n';
				output.value = output.value + e.toString() + '\n';
			});
			if (res === 'granted') {
				output.value = output.value + 'Can use device motion sensor\n';
				window.addEventListener('devicemotion', onDeviceMotion, true);
			}
		} else {
			window.addEventListener('devicemotion', onDeviceMotion, true);
		}
	}

	function onDeviceOrientation(e) {
		if (!starting) return;
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
		if (!starting) return;
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
