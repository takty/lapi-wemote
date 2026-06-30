/**
 * Controller - Wemote
 * @author Takuto Yanagida
 * @version 2026-06-30
 */

import { Connection } from './connection.ts';

const ROOM_ID_PREFIX = 'wemote-';

export class Controller {

	con: Connection|null = null;
	isStarting: boolean  = false;
	isExpired: boolean   = false;
	isFirst: boolean     = true;

	roomId: string;

	notifyOrientationChanged: Function;
	notifyMotionChanged: Function;
	notifyStateChanged: Function;

	constructor(onStateChanged: Function, onOrientation: Function, onMotion: Function) {
		this.notifyStateChanged       = onStateChanged;
		this.notifyOrientationChanged = onOrientation;
		this.notifyMotionChanged      = onMotion;

		const href = location.href;
		const pi   = href.indexOf('?');
		const hash = pi === -1 ? '' : href.substring(pi + 1);
		const date = pi === -1 ? '' : href.substring(href.length - 8);

		this.roomId = ROOM_ID_PREFIX + hash;

		const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
		if (date !== today) {
			this.isExpired = true;
			this.notifyStateChanged('expired');
		}
	}

	async start() {
		this.#turnOn();
		if (!this.isExpired) {
			if (this.con) stop();
			this.con = new Connection(this.roomId, null, (msg: string, e: Event) => this.#onStateChange(msg, e));
			setTimeout(() => { if (this.con) this.con.start(); }, 10);
		}
	}

	stop() {
		this.#turnOff();
		if (!this.isExpired) {
			if (!this.con) return;
			this.con.stop();
			this.con = null;
		}
	}

	#onStateChange(msg: string, e: Event) {
		this.notifyStateChanged(msg);
		if (msg === 'disconnect') {
			this.#turnOff();
		}
	}

	#turnOn() {
		this.isStarting = true;
		if (this.isExpired) this.notifyStateChanged('expired');

		if (this.isFirst) {
			this.#setEventListener();
			this.isFirst = false;
		}
		this.notifyStateChanged('start');
	}

	#turnOff() {
		this.isStarting = false;
		if (this.isExpired) this.notifyStateChanged('expired');
		this.notifyStateChanged('stop');
	}

	#send(data: string) {
		if (this.con) {
			this.con.send(data);
		}
	}


	// -------------------------------------------------------------------------


	async #setEventListener() {
		await this.#setOrientationEventListener();
		await this.#setMotionEventListener();
	}

	async #setOrientationEventListener() {
		// @ts-ignore
		if (DeviceOrientationEvent.requestPermission) {
			this.notifyStateChanged('req_per_ori');
			// @ts-ignore
			const res = await DeviceOrientationEvent.requestPermission().catch((e) => {
				this.notifyStateChanged('rejected', e.toString());
				console.log(e);
			});
			if (res === 'granted') {
				this.notifyStateChanged('ok');
				window.addEventListener('deviceorientation', e => this.#onDeviceOrientation(e), true);
			}
		} else {
			window.addEventListener('deviceorientation', e => this.#onDeviceOrientation(e), true);
		}
	}

	async #setMotionEventListener() {
		// @ts-ignore
		if (DeviceMotionEvent.requestPermission) {
			this.notifyStateChanged('req_per_mot');
			// @ts-ignore
			const res = await DeviceMotionEvent.requestPermission().catch((e) => {
				this.notifyStateChanged('rejected', e.toString());
				console.log(e);
			});
			if (res === 'granted') {
				this.notifyStateChanged('ok');
				window.addEventListener('devicemotion', e => this.#onDeviceMotion(e), true);
			}
		} else {
			window.addEventListener('devicemotion', e => this.#onDeviceMotion(e), true);
		}
	}

	#onDeviceOrientation(e: DeviceOrientationEvent) {
		if (!this.isStarting) return;
		const ds = {
			x: Math.round(e.beta ?? 0),  // -180 - 180 [deg]
			y: Math.round(e.gamma ?? 0), //  -90 -  90
			z: Math.round(e.alpha ?? 0)  //    0 - 360
		};
		this.#send(JSON.stringify({ orientation: ds }));
		this.notifyOrientationChanged(ds);
	}

	#onDeviceMotion(e: DeviceMotionEvent) {
		if (!this.isStarting) return;
		const as = {
			x: Math.round((e.acceleration?.x ?? 0) * 100) / 100,  // [m/s2]
			y: Math.round((e.acceleration?.y ?? 0) * 100) / 100,
			z: Math.round((e.acceleration?.z ?? 0) * 100) / 100
		};
		const ags = {
			x: Math.round((e.accelerationIncludingGravity?.x ?? 0) * 100) / 100,  // [m/s2]
			y: Math.round((e.accelerationIncludingGravity?.y ?? 0) * 100) / 100,
			z: Math.round((e.accelerationIncludingGravity?.z ?? 0) * 100) / 100
		};
		const rrs = {
			x: Math.round(e.rotationRate?.beta ?? 0),  // -360 - 360 [deg]
			y: Math.round(e.rotationRate?.gamma ?? 0), // -360 - 360
			z: Math.round(e.rotationRate?.alpha ?? 0)  // -360 - 360
		};
		this.#send(JSON.stringify({ acceleration: as, acceleration_gravity: ags, rotation: rrs }));
		this.notifyMotionChanged(as, ags, rrs);
	}

}
