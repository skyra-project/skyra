const { structures: { Command }, util: { CanvasConstructor } } = require('../../index');
const { fetchAvatar } = require('../../functions/wrappers');
const fsn = require('fs-nextra');
const path = require('path');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['ATTACH_FILES'],
			guildOnly: true,

			cooldown: 30,

			usage: '<user:advuser>',
			description: 'Hugs!'
		});

		this.template = null;
	}

	async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'hug.png' }] });
	}

	async generate(msg, user) {
		if (user.id === msg.author.id) user = this.client.user;

		const [hugged, hugger] = await Promise.all([
			fetchAvatar(user, 256),
			fetchAvatar(msg.author, 256)
		]);

		return new CanvasConstructor(660, 403)
			.addImage(this.template, 0, 0, 660, 403)
			.save()
			.addImage(hugger, 124, 92, 109, 109, { type: 'round', radius: 54 })
			.restore()
			.addImage(hugged, 233, 57, 98, 98, { type: 'round', radius: 49 })
			.toBufferAsync();
	}

	async init() {
		this.template = await fsn.readFile(path.join(__dirname, '../../assets/images/memes/hug.png'));
	}

};
