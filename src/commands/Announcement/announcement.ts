const { Command, util: { announcementCheck }, MessageEmbed } = require('../../index');

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['announce'],
			requiredPermissions: ['MANAGE_ROLES'],
			bucket: 6,
			cooldown: 30,
			description: (language) => language.get('COMMAND_ANNOUNCEMENT_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_ANNOUNCEMENT_EXTENDED'),
			permissionLevel: 4,
			runIn: ['text'],
			usage: '<announcement:string{,1900}>'
		});
	}

	public async run(msg, [message]) {
		const announcementID = msg.guild.settings.channels.announcement;
		if (!announcementID) throw msg.language.get('COMMAND_SUBSCRIBE_NO_CHANNEL');

		const channel = msg.guild.channels.get(announcementID);
		if (!channel) throw msg.language.get('COMMAND_SUBSCRIBE_NO_CHANNEL');

		if (!channel.postable) throw msg.language.get('SYSTEM_CHANNEL_NOT_POSTABLE');

		const role = announcementCheck(msg);
		const content = `${msg.language.get('COMMAND_ANNOUNCEMENT', role)}\n${message}`;

		if (await this.ask(msg, content)) {
			await this.send(msg, channel, role, content);
			return msg.sendLocale('COMMAND_ANNOUNCEMENT_SUCCESS');
		}

		return msg.sendLocale('COMMAND_ANNOUNCEMENT_CANCELLED');
	}

	public ask(msg, content) {
		try {
			return msg.ask(msg.language.get('COMMAND_ANNOUNCEMENT_PROMPT'), {
				embed: new MessageEmbed()
					.setColor(msg.member.displayColor || 0xDFDFDF)
					.setDescription(content)
					.setTimestamp()
			});
		} catch (_) {
			return false;
		}
	}

	public async send(msg, channel, role, content) {
		await role.edit({ mentionable: true });
		await channel.send(content);
		await role.edit({ mentionable: false });
	}

};
