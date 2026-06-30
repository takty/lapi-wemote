import { spawn } from "node:child_process";
import * as esbuild from "esbuild";
import { copyFiles, watch } from './tasks.mjs';

const SRC_DIR    = 'src';
const DST_DIR    = 'dist';
const TS_OUT_DIR = `${DST_DIR}/v1`;

const SUFFIX_PHP = '.php';
const SUFFIX_TS  = '.ts';

const ENTRY_POINTS = [
	"src/v1/connection.ts",
	"src/v1/controller.ts",
	"src/v1/receiver.ts",
];

const ESBUILD_OPTIONS = {
	entryPoints: ENTRY_POINTS,
	bundle     : true,
	minify     : true,
	sourcemap  : true,
	format     : "esm",
	target     : "es2020",
	outdir     : TS_OUT_DIR,
	entryNames : "[name].min",
};

function typeCheck() {
	return new Promise((resolve, reject) => {
		const p = spawn(process.execPath, [
			"node_modules/typescript/bin/tsc",
			"--noEmit",
		], {
			stdio: "inherit",
		});

		p.on("close", code => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`tsc failed with code ${code}`));
			}
		});

		p.on("error", reject);
	});
}

async function buildTs() {
	await typeCheck();

	await esbuild.build(ESBUILD_OPTIONS);
	console.log("TS build completed.");
}

async function buildPhp() {
	await copyFiles(SRC_DIR, DST_DIR, SUFFIX_PHP);
}

// -----------------------------------------------------------------------------

async function build() {
	await buildPhp();
	await buildTs();
}

async function runSafely(fn) {
	try {
		await fn();
	} catch (e) {
		console.error(e.stderr ?? e.message ?? e);
	}
}

await runSafely(build);

if (process.argv.includes('--watch')) {
	console.log(`watching: ${SRC_DIR}`);
	watch(SRC_DIR, SUFFIX_PHP, () => runSafely(buildPhp));

	const ctx = await esbuild.context(ESBUILD_OPTIONS);
	await ctx.watch();

	watch(SRC_DIR, SUFFIX_TS, () => runSafely(typeCheck));
}
