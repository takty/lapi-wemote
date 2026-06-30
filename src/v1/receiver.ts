/**
 * Receiver - Wemote
 * @author Takuto Yanagida
 * @version 2026-06-30
 */

import { Connection } from './connection.ts';

const ROOM_ID_PREFIX = 'wemote-';
const HASH_LENGTH    = 16;

export function createId() {
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

function _createHash(len: number) {
	const vs = crypto.getRandomValues(new Uint8Array(len));
	const ns = [];
	for (let i = 0; i < vs.length; i += 1) ns.push(vs[i].toString(16));
	return ns.join('').substring(0, len);
}

let con: Connection|null = null;

export function start(id: string, onMessage: Function, onStateChange: Function) {
	if (con) stop();
	con = new Connection(ROOM_ID_PREFIX + id, onMessage, onStateChange);
	setTimeout(() => { if (con) con.start(); }, 10);
}

export function stop() {
	if (!con) return;
	con.stop();
	con = null;
}
