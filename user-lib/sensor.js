/**
 * Sensor
 *
 * @author Takuto Yanagida
 * @version 2020-04-25
 */


const SENSOR = (function () {
	CROQUJS.loadScriptSync('https://laccolla.com/api/wemote/v1/receiver.min.js?test');

	'use strict';

	class Motion extends WIDGET.Widget {
		constructor() {
			super();

			this._state = false;
			this._btn   = null;

			this._ori = null;
			this._acc = null;
			this._acg = null;
			this._rot = null;

			this._id           = '';
			this._qrCode       = null;
			this._stShowQrCode = null;

			this._btn = document.createElement('a');
			this._btn.className = '__widget __widget-button';
			this._btn.onmousedown = (ev) => {
				this._state = !this._state;
				ev.target.classList.toggle('__widget-button-pushed');
				this._toggleSensor(this._state);
			};
			this._base.appendChild(this._btn);
		}

		_toggleSensor(state) {
			if (state) {
				this._id = WEMOTE.RECEIVER.createId();
				WEMOTE.RECEIVER.start(this._id, (e) => { this._onMessage(e); }, (e) => { this._onStateChange(e); });
			} else {
				WEMOTE.RECEIVER.stop();
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
				this._btn.classList.remove('__widget-button-pushed');
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
			WEMOTE.RECEIVER.createQrCode(d, id);
			d.querySelector('img').style.border = 'solid 8px #fff';
			d.addEventListener('click', () => {
				WEMOTE.RECEIVER.stop();
				this._btn.classList.remove('__widget-button-pushed');
				this._state = false;
				document.body.removeChild(d);
			});
			this._qrCode = d;
		}

		_hideQrCode() {
			document.body.removeChild(this._qrCode);
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

	return {
		Motion,
	};

}());
