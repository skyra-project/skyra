const { structures: { Command }, util: { CanvasConstructor, util } } = require('../../index');
const fsn = require('fs-nextra');
const path = require('path');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['ATTACH_FILES'],
			guildOnly: true,

			cooldown: 30,

			usage: '<user:advuser>',
			description: 'How dare you pinging me!',
			extend: {
				EXPLANATION: [
					'There are a few things that annoy kyra, one of them are **Windows 10\'s notifications**! Which also',
					'includes mentions from Discord, hence why this command exists.'
				].join(' '),
				REMINDER: 'If you mentioned kyra, you must self-execute this command against you.'
			}
		});

		this.kyra = null;
		this.template = null;
	}

	async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'pingkyra.png' }] });
	}

	async generate(msg, user) {
		if (user.id === this.kyra.id || user.id === this.client.user.id) user = msg.author;

		const [runner, kyra] = await Promise.all([
			util.fetchAvatar(user, 128),
			util.fetchAvatar(this.kyra, 128)
		]);

		return new CanvasConstructor(569, 327)
			.addImage(this.template, 0, 0, 569, 327)
			.save()
			.addImage(runner, 118, 27, 52, 52, { type: 'round', radius: 26 })
			.restore()
			.addImage(kyra, 368, 34, 50, 50, { type: 'round', radius: 25 })
			.toBufferAsync();
	}

	async init() {
		[this.kyra, this.template] = await Promise.all([
			this.client.users.fetch('242043489611808769'),
			fsn.readFile(path.join(__dirname, '../../assets/images/memes/pingkyra.png'))
		]);
	}

};
