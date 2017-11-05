const { structures: { Command }, util: { util } } = require('../../index');
const streamToArray = require('stream-to-array');
const fsn = require('fs-nextra');
const path = require('path');
const GIFEncoder = require('gifencoder');
const Canvas = require('canvas');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['ATTACH_FILES'],
			guildOnly: true,
			spam: true,

			cooldown: 30,

			usage: '[user:advuser]',
			description: 'I am, TRIGGERED',
			extend: {
				EXPLANATION: 'What? My commands are not enough userfriendly? (╯°□°）╯︵ ┻━┻',
				ARGUMENTS: '[user]',
				EXP_USAGE: [
					['user', 'The user to be triggered.']
				],
				EXAMPLES: [
					'Your waifu is not real'
				]
			}
		});

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
		imgTriggered.src = await util.fetchAvatar(user, 512);

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

		return streamToArray(stream).then(Buffer.concat);
	}

	async init() {
		this.template = await fsn.readFile(path.join(__dirname, '../../assets/images/memes/triggered.png'));
	}

};
