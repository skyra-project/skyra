const { structures: { Command }, management } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			botPerms: ['MANAGE_ROLES'],
			aliases: ['announce'],
			permLevel: 2,
			cooldown: 60,

			usage: '<announcement:string>',
			description: 'Send new announcements, mentioning the announcement role.',
			extend: {
				EXPLANATION: [
					'This command requires an announcement channel (**channels::announcement** in the configuration command)',
					'which tells Skyra where she should post the announcement messages. Question is, is this command needed?',
					'Well, nothing stops you from making your announcements by yourself, however, there are many people who hate',
					'being mentioned by at everyone/here. To avoid this, Skyra gives you the option of creating a subscriber role,',
					'which is unmentionable (to avoid people spam mentioning the role), and once you run this command,',
					'Skyra will set the role to be mentionable, post the message, and back to unmentionable.'
				].join(' '),
				ARGUMENTS: '<announcement>',
				EXP_USAGE: [
					['announcement', 'The announcement text to post.']
				],
				EXAMPLES: [
					'I am glad to announce that we have a bot able to safely send announcements for our subscribers!'
				]
			}
		});
	}

	async run(msg, [message], settings, i18n) {
		const announcementID = settings.channels.announcement;
		if (!announcementID) throw i18n.get('COMMAND_SUBSCRIBE_NO_CHANNEL');

		const channel = msg.guild.channels.get(announcementID);
		if (!channel) throw i18n.get('COMMAND_SUBSCRIBE_NO_CHANNEL');

		if (channel.postable === false) throw i18n.get('SYSTEM_CHANNEL_NOT_POSTABLE');

		const role = management.announcement(msg);
		await role.edit({ mentionable: true })
			.catch(Command.handleError);
		await channel.send(`${i18n.get('COMMAND_ANNOUNCEMENT', role)}\n${message}`)
			.catch(Command.handleError);
		await role.edit({ mentionable: false })
			.catch(Command.handleError);

		return msg.send(i18n.get('COMMAND_SUCCESS'));
	}

};
