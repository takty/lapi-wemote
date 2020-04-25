/**
 * Receiver - Wemote
 * @author Takuto Yanagida
 * @version 2020-04-25
 */


window.WEMOTE = window['WEMOTE'] || {};


(function (NS) {
	const URL_CONTROLLER = 'https://laccolla.com/api/wemote/v1/controller/';
	const ROOMID_PREFIX  = 'wemote-';
	const HASH_LENGTH    = 16;

	function loadScript(src) {
		const s = document.createElement('script');
		s.src = src;
		document.head.appendChild(s);
	}
	loadScript('https://laccolla.com/api/wemote/v1/lib/qrcode.min.js');
	loadScript('https://laccolla.com/api/wemote/v1/connection.min.js');

	function createId() {
		const date = localStorage.getItem('wemote-date');
		const hash = localStorage.getItem('wemote-hash');

		const d = _getToday();
		if (hash && date && date === d) return hash + date;

		const h = _createHash(HASH_LENGTH);
		localStorage.setItem('wemote-date', d);
		localStorage.setItem('wemote-hash', h);
		return h + d;
	}

	function _getToday() {
		return new Date().toISOString().split('T')[0].replace(/-/g, '');
	}

	function _createHash(len) {
		const vs = crypto.getRandomValues(new Uint8Array(len));
		const ns = [];
		for (let i = 0; i < vs.length; i += 1) ns.push(vs[i].toString(16));
		return ns.join('').substring(0, len);
	}

	function createQrCode(parent, id) {
		const qr = new QRCode(parent, {
			text        : URL_CONTROLLER + '?' + id,
			width       : 256,
			height      : 256,
			correctLevel: QRCode.CorrectLevel.H
		});
		return qr;
	}

	let con = null;

	function start(id, onMessage, onStateChange) {
		if (con) stop();
		con = new WEMOTE.Connection(ROOMID_PREFIX + id, onMessage, onStateChange);
		setTimeout(() => { con.start(); }, 10);
	}

	function stop() {
		if (!con) return;
		con.stop();
		con = null;
	}

	NS.RECEIVER = { createId, createQrCode, start, stop };

}(window.WEMOTE));
