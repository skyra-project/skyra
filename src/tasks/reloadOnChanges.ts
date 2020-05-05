// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Events } from '@lib/types/Enums';
import { WATCH_FILES } from '@root/config';
import { floatPromise } from '@utils/util';
import { watch } from 'chokidar';
import { KlasaMessage, Piece, Stopwatch, Task } from 'klasa';
import { basename, extname, join, sep } from 'path';

const nodeModules = `${sep}node_modules${sep}`;

/*
 * When any piece file is changed in your bot (e.g. when you `git pull`, or just edit a file),
 * this piece will automatically reload that piece so the change is instantly updated into
 * your bot. Test this piece on a test bot before using it in production.
 */

const fakeMessage = {
	sendLocale() { return Promise.resolve({}); },
	sendMessage() { return Promise.resolve({}); }
} as unknown as KlasaMessage;

interface Reload extends SkyraCommand {
	everything(message: KlasaMessage): Promise<unknown>;
}

interface Run {
	name: string;
	store: string | null;
	piece: Piece | null;
}

export default class extends Task {

	private running = false;

	public async run({ name, store, piece }: Run) {
		const timer = new Stopwatch();

		for (const module of Object.keys(require.cache)) {
			if (!module.includes(nodeModules) && extname(module) !== '.node') {
				delete require.cache[module];
			}
		}

		let log = '';
		const reload = this.client.commands.get('reload') as Reload;
		if (piece === null) {
			await reload.everything(fakeMessage);
			log = `Reloaded everything in ${timer.stop()}.`;
		} else {
			await reload.run(fakeMessage, [piece]);
			log = `Reloaded it in ${timer.stop()}`;
		}

		this.client.emit(Events.Verbose, `[${store}] ${name} was updated. ${log}`);
		await import('@utils/initClean');
	}

	public init() {
		// Unload task if not running on development mode
		if (!this.client.options.dev || !WATCH_FILES) {
			this.unload();
			return Promise.resolve();
		}

		// Do not create a second FS watcher
		if (this.client.fsWatcher !== null) return Promise.resolve();

		this.client.fsWatcher = watch(join(process.cwd(), 'dist'), {
			ignored: [
				'**/tsconfig.tsbuildinfo',
				'**/bwd/provider/**'
			],
			persistent: true,
			ignoreInitial: true,
			cwd: process.cwd()
		});

		const reloadStore = async (path: string) => {
			const name = basename(path);
			const store = path.split(sep).find(dir => this.client.pieceStores.has(dir)) ?? null;
			const piece = store ? this.client.pieceStores.get(store).get(name.replace(extname(name), '')) ?? null : null;


			if (!piece) {
				if (this.running) return;
				this.running = true;
				await this.run({ name, store, piece });
				this.running = false;
				return;
			}

			floatPromise(this, this.run({ name, store, piece }));
		};

		for (const event of ['add', 'change', 'unlink']) {
			this.client.fsWatcher.on(event, reloadStore);
		}

		return Promise.resolve();
	}

}
