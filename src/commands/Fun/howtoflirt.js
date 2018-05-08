const { Command, util: { fetchAvatar }, assetsFolder } = require('../../index');
const { readFile } = require('fs-nextra');
const { join } = require('path');
const Canvas = require('canvas');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			bucket: 2,
			cooldown: 30,
			description: (msg) => msg.language.get('COMMAND_HOWTOFLIRT_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_HOWTOFLIRT_EXTENDED'),
			runIn: ['text'],
			usage: '<user:username>'
		});
		this.spam = true;
		this.template = null;
	}

	async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'HowToFlirt.png' }] });
	}

	async generate(msg, user) {
		/* Initialize Canvas */
		const canvas = Canvas.createCanvas(500, 500);
		const background = new Canvas.Image();
		const user1 = new Canvas.Image();
		const user2 = new Canvas.Image();
		const ctx = canvas.getContext('2d');

		if (user.id === msg.author.id) ({ user } = this.client);

		/* Get the buffers from both profile avatars */
		const [user1Buffer, user2Buffer] = await Promise.all([
			fetchAvatar(msg.author, 128),
			fetchAvatar(user, 128)
		]);

		/* Background */
		background.onload = () => ctx.drawImage(background, 0, 0, 500, 500);
		background.src = this.template;
		user1.src = user1Buffer;
		user2.src = user2Buffer;

		/* Tony */
		await Promise.all(coord1.map(({ center, radius }) => new Promise((res) => {
			ctx.save();
			ctx.beginPath();
			ctx.arc(center[0], center[1], radius, 0, Math.PI * 2, false);
			ctx.clip();
			ctx.drawImage(user1, center[0] - radius, center[1] - radius, radius * 2, radius * 2);
			ctx.restore();
			res();
		})));
		/* Capitain */
		await Promise.all(coord2.map(({ center, radius }) => new Promise((res) => {
			ctx.save();
			ctx.beginPath();
			ctx.arc(center[0], center[1], radius, 0, Math.PI * 2, false);
			ctx.clip();
			ctx.drawImage(user2, center[0] - radius, center[1] - radius, radius * 2, radius * 2);
			user2.src = user2Buffer;
			ctx.restore();
			res();
		})));

		return canvas.toBuffer();
	}

	async init() {
		this.template = await readFile(join(assetsFolder, '/images/memes/howtoflirt.png'));
	}

};

const coord1 = [
	{ center: [211, 53], radius: 18 },
	{ center: [136, 237], radius: 53 },
	{ center: [130, 385], radius: 34 }
];
const coord2 = [
	{ center: [35, 25], radius: 22 },
	{ center: [326, 67], radius: 50 },
	{ center: [351, 229], radius: 43 },
	{ center: [351, 390], radius: 40 }
];
