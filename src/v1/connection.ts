/**
 * Connection - Wemote
 * @author Takuto Yanagida
 * @version 2026-06-30
 */

import type { ConnectionOptions, Connection as Con } from "@open-ayame/ayame-web-sdk";
import * as Ayame from "@open-ayame/ayame-web-sdk";

const URL_SIGNALING = 'wss://ayame-labo.shiguredo.app/signaling';

export class Connection {

	_roomId : string;
	_onMsg  : any;
	_onState: any;

	_opts : ConnectionOptions;
	_label: string;
	_con  : Con|null;
	_ch   : RTCDataChannel|null;

	constructor(roomId: string, onMessage: Function|null = null, onStateChange: Function|null = null) {
		this._roomId  = roomId;
		this._onMsg   = onMessage;
		this._onState = onStateChange;

		this._opts              = Ayame.defaultOptions;
		this._opts.signalingKey = '';
		this._label             = 'wemote';
		this._con               = null;
		this._ch                = null;
	}

	async getApiKey() {
		const res = await fetch(`https://takty.net/api/wemote/v1/`, {
			mode       : 'cors',
			cache      : 'no-cache',
			credentials: 'same-origin',
			headers    : { 'Content-Type': 'application/json; charset=utf-8', },
			referrer   : 'no-referrer',
		});
		return res.json();
	}

	async start() {
		if (this._opts.signalingKey == '') {
			this._opts.signalingKey = await this.getApiKey();
		}

		this._con = Ayame.createConnection(URL_SIGNALING, 'takty@' + this._roomId, this._opts, false);

		this._con.on('open', async (e: Event) => {
			if (this._con === null) return;
			this._ch = await this._con.createDataChannel(this._label, undefined)!;
			if (this._ch) {
				this._ch.onmessage = (e) => { this.receive(e) };
			}
			if (this._onState) this._onState('open', e);
		});
		this._con.on('connect', (e: Event) => {
			if (this._onState) this._onState('connect', e);
		});
		this._con.on('datachannel', (ch: RTCDataChannel) => {
			if (!this._ch) {
				this._ch = ch;
				this._ch.onmessage = (e: MessageEvent) => { this.receive(e) };
			}
		});
		this._con.on('disconnect', (e: Event) => {
			this._con = null;
			this._ch  = null;
			if (this._onState) this._onState('disconnect', e);
		});
		this._con.on('bye', (e: Event) => {
			if (this._onState) this._onState('bye', e);
		});
		await this._con.connect(null).catch((e: Event) => {console.log(e);});
	}

	stop() {
		if (this._con) this._con.disconnect();
	}

	send(data: string) {
		if (this._ch && this._ch.readyState === 'open') {
			this._ch.send(data);
		}
	}

	receive(e: MessageEvent) {
		if (this._onMsg) this._onMsg(e.data);
	}

}
