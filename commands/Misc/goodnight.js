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
			description: 'Give somebody a nice Good Night!',
			EXPLANATION: [
				'This command generates an image. and it is perfect, it shows a mother giving a goodnight kiss to her',
				'child in the bed.'
			].join(' ')
		});

		this.template = null;
	}

	async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'goodNight.png' }] });
	}

	async generate(msg, user) {
		if (user.id === msg.author.id) user = this.client.user;

		const [kisser, child] = await Promise.all([
			util.fetchAvatar(msg.author, 256),
			util.fetchAvatar(user, 256)
		]);

		return new CanvasConstructor(500, 322)
			.addImage(this.template, 0, 0, 636, 366)
			.save()
			.addImage(kisser, 315, 25, 146, 146, { type: 'round', radius: 73 })
			.restore()
			.addImage(child, 350, 170, 110, 110, { type: 'round', radius: 55 })
			.toBufferAsync();
	}

	async init() {
		this.template = await fsn.readFile(path.join(__dirname, '../../assets/images/memes/goodnight.png'));
	}

};
