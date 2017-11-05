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
			description: 'I NEED HEALING!'
		});

		this.template = null;
	}

	async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'INeedHealing.png' }] });
	}

	async generate(msg, user) {
		if (user.id === msg.author.id) user = this.client.user;

		const [healer, healed] = await Promise.all([
			util.fetchAvatar(msg.author, 128),
			util.fetchAvatar(user, 128)
		]);

		return new CanvasConstructor(333, 500)
			.addImage(this.template, 0, 0, 333, 500)
			.save()
			.addImage(healer, 189, 232, 110, 110, { type: 'round', radius: 55 })
			.restore()
			.addImage(healed, 70, 96, 106, 106, { type: 'round', radius: 53 })
			.toBufferAsync();
	}

	async init() {
		this.template = await fsn.readFile(path.join(__dirname, '../../assets/images/memes/ineedhealing.png'));
	}

};
