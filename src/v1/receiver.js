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

	function createHash() {
		return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(HASH_LENGTH)))).substring(0, HASH_LENGTH);
	}

	function createQrCode(parent, hash) {
		const qr = new QRCode(parent, {
			text        : URL_CONTROLLER + '?' + hash,
			width       : 256,
			height      : 256,
			correctLevel: QRCode.CorrectLevel.H
		});
		return qr;
	}

	let con = null;

	function start(hash, onMessage, onStageChange) {
		if (con) stop();
		con = new WEMOTE.Connection(ROOMID_PREFIX + hash, onMessage, onStageChange);
		setTimeout(() => { con.start(); }, 10);
	}

	function stop() {
		if (!con) return;
		con.stop();
		con = null;
	}

	NS.RECEIVER = { createHash, createQrCode, start, stop };

}(window.WEMOTE));
