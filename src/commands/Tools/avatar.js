const { Command, MessageEmbed } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 15,
			description: (language) => language.get('COMMAND_AVATAR_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_AVATAR_EXTENDED'),
			runIn: ['text'],
			usage: '[user:username]'
		});
	}

	async run(msg, [user = msg.author]) {
		if (!user.avatar) throw msg.language.get('COMMAND_AVATAR_NONE');
		return msg.sendEmbed(new MessageEmbed()
			.setAuthor(user.tag, user.avatarURL({ size: 64 }))
			.setColor(msg.member.displayColor || 0xdfdfdf)
			.setImage(user.avatarURL({ size: 2048 })));
	}

};
