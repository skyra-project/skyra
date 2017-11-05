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
			description: 'Slap another user using the Batman & Robin Meme.',
			extend: {
				EXPLANATION: 'The hell are you saying? *Slaps*. This meme is based on a comic from Batman and Robin.',
				ARGUMENTS: '<user>',
				EXP_USAGE: [
					['user', 'The user you wish to slap']
				],
				EXAMPLES: ['Skyra']
			}
		});

		this.template = null;
	}

	async run(msg, [user]) {
		const attachment = await this.generate(msg, user);
		return msg.channel.send({ files: [{ attachment, name: 'slap.png' }] });
	}

	async generate(msg, user) {
		let selectedUser;
		let slapper;
		if (user.id === '242043489611808769' === msg.author.id) throw '💥';
		if (user === msg.author) [selectedUser, slapper] = [msg.author, this.client.user];
		else if (['242043489611808769', '251484593859985411'].includes(user.id)) [selectedUser, slapper] = [msg.author, user];
		else [selectedUser, slapper] = [user, msg.author];

		const [Slapped, Slapper] = await Promise.all([
			util.fetchAvatar(selectedUser, 256),
			util.fetchAvatar(slapper, 256)
		]);

		/* Initialize Canvas */
		return new CanvasConstructor(950, 475)
			.addImage(this.template, 0, 0, 950, 475)
			.save()
			.addImage(Slapper, 410, 107, 131, 131, { type: 'round', radius: 66 })
			.restore()
			.addImage(Slapped, 159, 180, 169, 169, { type: 'round', radius: 85 })
			.toBufferAsync();
	}

	async init() {
		this.template = await fsn.readFile(path.join(__dirname, '../../assets/images/memes/imageSlap.png'));
	}

};
