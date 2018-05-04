const { Command, util: { fetchAvatar }, assetsFolder } = require('../../index');
const { readFile } = require('fs-nextra');
const { join } = require('path');
const GIFEncoder = require('gifencoder');
const Canvas = require('canvas');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 30,
			description: (msg) => msg.language.get('COMMAND_TRIGGERED_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_TRIGGERED_EXTENDED'),
			runIn: ['text'],
			spam: true,
			usage: '[user:username]'
		});

		this.spam = true;
		this.template = null;
	}

	async run(msg, [user = msg.author]) {
		const attachment = await this.generate(user);
		return msg.channel.send({ files: [{ attachment, name: 'triggered.gif' }] });
	}

	async generate(user) {
		const imgTitle = new Canvas.Image();
		const imgTriggered = new Canvas.Image();
		const encoder = new GIFEncoder(350, 393);
		const canvas = Canvas.createCanvas(350, 393);
		const ctx = canvas.getContext('2d');

		imgTitle.src = this.template;
		imgTriggered.src = await fetchAvatar(user, 512);

		const stream = encoder.createReadStream();
		encoder.start();
		encoder.setRepeat(0);
		encoder.setDelay(50);
		encoder.setQuality(200);

		const coord1 = [-25, -50, -42, -14];
		const coord2 = [-25, -13, -34, -10];

		for (let i = 0; i < 4; i++) {
			ctx.drawImage(imgTriggered, coord1[i], coord2[i], 400, 400);
			ctx.fillStyle = 'rgba(255 , 100, 0, 0.4)';
			ctx.drawImage(imgTitle, 0, 340, 350, 53);
			ctx.fillRect(0, 0, 350, 350);
			encoder.addFrame(ctx);
		}

		encoder.finish();

		return this.streamToArray(stream).then(Buffer.concat);
	}

	/**
	 * @param {ReadableStream} stream The stream.
	 * @returns {Promise<[]>}
	 */
	streamToArray(stream) {
		if (!stream.readable) return Promise.resolve([]);
		return new Promise((res, rej) => {
			const array = [];

			function onData(data) {
				array.push(data);
			}

			function onEnd(error) {
				if (error) rej(error);
				else res(array);
				cleanup();
			}

			function onClose() {
				res(array);
				cleanup();
			}

			function cleanup() {
				stream.removeListener('data', onData);
				stream.removeListener('end', onEnd);
				stream.removeListener('error', onEnd);
				stream.removeListener('close', onClose);
			}

			stream.on('data', onData);
			stream.on('end', onEnd);
			stream.on('error', onEnd);
			stream.on('close', onClose);
		});
	}

	async init() {
		this.template = await readFile(join(assetsFolder, './images/memes/triggered.png'))
			.catch(error => this.client.emit('wtf', `[COMMAND::INIT] ${this} | Failed to load file:\n${error.stack}`));
	}

};
