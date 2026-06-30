/**
 * Sample Controller
 * @author Takuto Yanagida
 * @version 2026-06-30
 */

import { Controller } from 'https://takty.net/api/wemote/v1/controller.min.js';

const MSGS = new Map(Object.entries({
	'expired'    : 'Your session has expired.',
	'req_per_ori': 'Requesting permission of device orientation sensor...',
	'req_per_mot': 'Requesting permission of device motion sensor...',
	'ok'         : 'OK!',
	'rejected'   : 'Rejected!',
}));

document.addEventListener('DOMContentLoaded', () => {

	const state    = document.getElementById('state');
	const output   = document.getElementById('output');
	const btnStart = document.getElementById('btn-start');
	const btnStop  = document.getElementById('btn-stop');

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

	const c = new Controller(onStateChanged, onOrientationChanged, onMotionChanged);

	btnStart.addEventListener('click', () => c.start());
	btnStop.addEventListener('click', () => c.stop());

	function onStateChanged(st, msg = null) {
		switch (st) {
			case 'start':
				onTurnOn();
				return;
			case 'stop':
				onTurnOff();
				return;
			case 'expired':
				state.style.backgroundColor = 'rgba(170, 0, 0, 0.5)';
				break;
			case 'open':
				state.style.backgroundColor = 'rgba(0, 170, 0, 0.25)';
				break;
			case 'connect':
				state.style.backgroundColor = 'rgba(0, 170, 0, 0.75)';
				break;
			case 'disconnect':
				state.style.backgroundColor = '';
				break;
		}
		if (MSGS.has(st)) {
			output.value = output.value + MSGS.get(st) + '\n';
		} else {
			output.value = output.value + st + '\n';
		}
		if (msg) {
			output.value += msg + '\n';
		}
	}

	function onTurnOn() {
		btnStart.disabled = true;
		btnStop.disabled  = false;
	}

	function onTurnOff() {
		btnStart.disabled = false;
		btnStop.disabled  = true;

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

	function onOrientationChanged(ds) {
		setMeter(metOriX, ds.x, -180, 180);
		setMeter(metOriY, ds.y,  -90,  90);
		setMeter(metOriZ, ds.z,    0, 360);
	}

	function onMotionChanged(as, ags, rrs) {
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
