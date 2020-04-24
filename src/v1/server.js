const WEMOTE_SERVER = (function () {

	function loadScript(src) {
		const s = document.createElement('script');
		s.src = src;
		document.head.appendChild(s);
	}
	loadScript('https://laccolla.com/api/wemote/v1/qrcode.min.js');
	loadScript('https://laccolla.com/api/wemote/v1/connection.js');

	const HASH_LENGTH   = 16;
	const URL_CLIENT    = 'https://laccolla.com/api/wemote/v1/client';
	const ROOMID_PREFIX = 'wemote-';

	function createHash() {
		return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(HASH_LENGTH)))).substring(0, HASH_LENGTH);
	}

	function createQrCode(parent, hash) {
		const qr = new QRCode(parent, {
			text        : URL_CLIENT + '?' + hash,
			width       : 128,
			height      : 128,
			correctLevel: QRCode.CorrectLevel.H
		});
		return qr;
	}

	let con = null;

	function start(hash, onMessage, onStageChange) {
		con = new Connection(ROOMID_PREFIX + hash, onMessage, onStageChange);
		setTimeout(() => { con.start(); }, 10);
	}

	function stop() {
		if (con) {
			con.stop();
			con = null;
		}
	}

	return {
		createHash,
		createQrCode,
		start,
		stop,
	};

}());
