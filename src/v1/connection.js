
(function () {
	function loadScript(src) {
		const s = document.createElement('script');
		s.src = src;
		document.head.appendChild(s);
	}
	loadScript('https://laccolla.com/api/wemote/v1/ayame.min.js');
})();

const URL_SIGNALING = 'wss://ayame-lite.shiguredo.jp/signaling';

class Connection {

	constructor(roomId, onMessage = null, onStateChange = null) {
		this._roomId  = roomId;
		this._onMsg   = onMessage;
		this._onState = onStateChange;

		this._opts  = Ayame.defaultOptions;
		this._label = 'dataChannel';
		this._con   = null;
		this._ch    = null;
	}

	async start() {
		this._con = Ayame.connection(URL_SIGNALING, this._roomId, this._opts, true);
		this._con.on('open', async (e) => {
			this._ch = await this._con.createDataChannel(this._label);
			if (this._ch) {
				this._ch.onmessage = (e) => { this.receive(e) };
			}
			if (this._onState) this._onState('open');
		});
		this._con.on('connect', (e) => {
			if (this._onState) this._onState('connect');
		});
		this._con.on('datachannel', (ch) => {
			if (!this._ch) {
				this._ch = ch;
				this._ch.onmessage = (e) => { this.receive(e) };
			}
		});
		this._con.on('disconnect', (e) => {
			this._con = null;
			this._ch = null;
			if (this._onState) this._onState('disconnect');
		});
		this._con.on('bye', (e) => {
			if (this._onState) this._onState('bye');
		});
		await this._con.connect(null).catch((e) => {console.log(e);});
	}

	stop() {
		if (this._con) this._con.disconnect();
	}

	send(data) {
		if (this._ch && this._ch.readyState === 'open') {
			this._ch.send(data);
		}
	}

	receive(e) {
		if (this._onMsg) this._onMsg(e.data);
	}

}
