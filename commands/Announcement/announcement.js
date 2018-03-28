const { Command, util: { announcementCheck } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['announce'],
			botPerms: ['MANAGE_ROLES'],
			bucket: 6,
			cooldown: 30,
			description: msg => msg.language.get('COMMAND_ANNOUNCEMENT_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_ANNOUNCEMENT_EXTENDED'),
			permLevel: 4,
			runIn: ['text'],
			usage: '<announcement:string>'
		});
	}

	async run(msg, [message]) {
		const announcementID = msg.guild.configs.channels.announcement;
		if (!announcementID) throw msg.language.get('COMMAND_SUBSCRIBE_NO_CHANNEL');

		const channel = msg.guild.channels.get(announcementID);
		if (!channel) throw msg.language.get('COMMAND_SUBSCRIBE_NO_CHANNEL');

		if (channel.postable === false) throw msg.language.get('SYSTEM_CHANNEL_NOT_POSTABLE');

		const role = announcementCheck(msg);
		await role.edit({ mentionable: true })
			.catch(Command.handleError);
		await channel.send(`${msg.language.get('COMMAND_ANNOUNCEMENT', role)}\n${message}`)
			.catch(Command.handleError);
		await role.edit({ mentionable: false })
			.catch(Command.handleError);

		return msg.sendMessage(msg.language.get('COMMAND_SUCCESS'));
	}

};
