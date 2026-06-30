/**
 * Motion
 *
 * @author Takuto Yanagida
 * @version 2026-06-29
 */

import * as receiver from 'https://takty.net/api/wemote/v1/receiver.min.js';

const URL_CONTROLLER = 'https://takty.net/api/wemote/sample-ctrl/';

export class Motion {

	constructor() {
		this._state = false;

		this._ori = null;
		this._acc = null;
		this._acg = null;
		this._rot = null;

		this._id           = '';
		this._qrCode       = null;
		this._stShowQrCode = null;
	}

	_toggleSensor(state) {
		if (state) {
			this._id = receiver.createId();
			receiver.start(this._id, e => this._onMessage(e), e => this._onStateChange(e));
		} else {
			receiver.stop();
		}
	}

	_onStateChange(e) {
		console.log(e);
		if (e === 'open') {
			this._stShowQrCode = setTimeout(() => { this._showQrCode(this._id); }, 400);
		} else if (e === 'connect') {
			clearTimeout(this._stShowQrCode);
			this._hideQrCode();
		} else if (e === 'disconnect') {
			this._state = false;
			this._ori = null;
			this._acc = null;
			this._acg = null;
			this._rot = null;
			this._id = '';
		}
	}

	_showQrCode(id) {
		const d = this._makeQrCodeParent();
		const qr = new QRCode(d, {
			text        : URL_CONTROLLER + '?' + id,
			width       : 256,
			height      : 256,
			correctLevel: QRCode.CorrectLevel.H
		});
		d.querySelector('img').style.border = 'solid 8px #fff';
		d.addEventListener('click', () => {
			receiver.stop();
			this._state = false;
			document.body.removeChild(d);
		});
		this._qrCode = d;
		console.log(URL_CONTROLLER + '?' + id);
	}

	_hideQrCode() {
		if (this._qrCode) document.body.removeChild(this._qrCode);
		this._qrCode = null
	}

	_makeQrCodeParent() {
		const d = document.createElement('div');
		d.style.position = 'fixed';
		d.style.top      = 0;
		d.style.left     = 0;
		d.style.right    = 0;
		d.style.bottom   = 0;

		d.style.display        = 'flex';
		d.style.alignItems     = 'center';
		d.style.justifyContent = 'center';

		d.style.backgroundColor = 'rgba(0,0,0,0.75)';
		document.body.appendChild(d);
		return d;
	}


	// ---------------------------------------------------------------------


	_onMessage(e) {
		try {
			const d = JSON.parse(e);
			if (d['orientation']) {
				this._ori = d.orientation;
			} else if (d['acceleration']) {
				this._acc = d.acceleration;
				this._acg = d.acceleration_gravity;
				this._rot = d.rotation;
			}
		} catch(e) {
			console.error(e);
		}
	}


	// ---------------------------------------------------------------------


	async start() {
		if (!this._state) {
			this._state = !this._state;
			this._toggleSensor(this._state);
		}
	}

	orientationX() {
		if (this._ori === null) return Number.NaN;
		return this._ori.x;
	}

	orientationY() {
		if (this._ori === null) return Number.NaN;
		return this._ori.y;
	}

	orientationZ() {
		if (this._ori === null) return Number.NaN;
		return this._ori.z;
	}

	accelerationX() {
		if (this._acc === null) return Number.NaN;
		return this._acc.x;
	}

	accelerationY() {
		if (this._acc === null) return Number.NaN;
		return this._acc.y;
	}

	accelerationZ() {
		if (this._acc === null) return Number.NaN;
		return this._acc.z;
	}

	accelerationGravityX() {
		if (this._acg === null) return Number.NaN;
		return this._acg.x;
	}

	accelerationGravityY() {
		if (this._acg === null) return Number.NaN;
		return this._acg.y;
	}

	accelerationGravityZ() {
		if (this._acg === null) return Number.NaN;
		return this._acg.z;
	}

	rotationX() {
		if (this._rot === null) return Number.NaN;
		return this._rot.x;
	}

	rotationY() {
		if (this._rot === null) return Number.NaN;
		return this._rot.y;
	}

	rotationZ() {
		if (this._rot === null) return Number.NaN;
		return this._rot.z;
	}

}
