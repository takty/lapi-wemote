document.addEventListener('DOMContentLoaded', () => {
	const URL_SIGNALING = 'wss://ayame-lite.shiguredo.jp/signaling';
	const ROOMID_PREFIX = 'wemote-';

	const href = location.href;
	const pidx = href.indexOf('?');
	const hash = pidx !== -1 ? href.substring(pidx + 1) : '';

	const roomId = ROOMID_PREFIX + hash;
	const label = 'dataChannel';
	const options = Ayame.defaultOptions;

	const output   = document.getElementById('output');
	const btnStart = document.getElementById('btn-start');
	const btnStop  = document.getElementById('btn-stop');

	btnStart.addEventListener('click', start);
	btnStop.addEventListener('click', stop);

	let con = null;
	let channel = null;

	async function start() {
		btnStart.disabled = true;
		btnStop.disabled = false;

		setEventListener();
		con = Ayame.connection(URL_SIGNALING, roomId, options);
		con.on('open', async (e) => {
			channel = await con.createDataChannel(label);
		});
		con.on('datachannel', (ch) => {
			if (!channel) channel = ch;
		});
		con.on('disconnect', (e) => {
			console.log(e);
			output.value = output.value + '\n' + e.toString();
			channel = null;
			btnStop.disabled = true;
		});
		await con.connect(null);
	}

	function send(data) {
		if (channel && channel.readyState === 'open') {
			channel.send(data);
		}
	}

	function stop() {
		if (con) con.disconnect();
	}


	// -------------------------------------------------------------------------


	function setEventListener() {
		if (DeviceMotionEvent.requestPermission) {
			output.value = output.value + '\n' + 'request permission of device motion sensor';
			DeviceMotionEvent.requestPermission().then((res) => {
				output.value = output.value + '\n' + 'Can use device motion sensor';
				if (res === 'granted') {
					window.addEventListener('devicemotion', onDeviceMotion);
				}
			}).catch((e) => {
				console.log(e);
				output.value = output.value + '\n' + 'Cannot use device motion sensor';
				output.value = output.value + '\n' + e.toString();
			});
		} else {
			window.addEventListener('devicemotion', onDeviceMotion);
		}
		if (DeviceOrientationEvent.requestPermission) {
			output.value = output.value + '\n' + 'request permission of device orientation sensor';
			DeviceOrientationEvent.requestPermission().then((res) => {
				output.value = output.value + '\n' + 'Can use device orientation sensor';
				if (res === 'granted') {
					window.addEventListener('deviceorientation', onDeviceOrientation);
				}
			}).catch((e) => {
				console.log(e);
				output.value = output.value + '\n' + 'Cannot use device orientation sensor';
				output.value = output.value + '\n' + e.toString();
			});
		} else {
			window.addEventListener('deviceorientation', onDeviceOrientation);
		}
	}

	function onDeviceOrientation(e) {
		const ds = {
			x: Math.round(e.beta),  // -180 - 180 [deg]
			y: Math.round(e.gamma), //  -90 -  90
			z: Math.round(e.alpha)  //    0 - 360
		};
		send(JSON.stringify({ euler_angles: ds }));
	}

	function onDeviceMotion(e) {
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
			x: Math.round(e.rotationRate.beta),  // -180 - 180 [deg]
			y: Math.round(e.rotationRate.gamma), //  -90 -  90
			z: Math.round(e.rotationRate.alpha)  //    0 - 360
		};
		send(JSON.stringify({ acceleration: as, acceleration_gravity: ags, rotation_rate: rrs }));
	}
});
