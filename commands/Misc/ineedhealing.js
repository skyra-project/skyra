const { Command, Canvas } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const { readFile } = require('fs-nextra');
const { join } = require('path');


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
			fetchAvatar(msg.author, 128),
			fetchAvatar(user, 128)
		]);

		return new Canvas(333, 500)
			.addImage(this.template, 0, 0, 333, 500)
			.save()
			.addImage(healer, 189, 232, 110, 110, { type: 'round', radius: 55 })
			.restore()
			.addImage(healed, 70, 96, 106, 106, { type: 'round', radius: 53 })
			.toBufferAsync();
	}

	async init() {
		this.template = await readFile(join(__dirname, '../../assets/images/memes/ineedhealing.png'));
	}

};
