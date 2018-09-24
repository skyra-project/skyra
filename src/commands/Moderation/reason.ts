const { Command, constants: { MODERATION: { SCHEMA_KEYS } }, klasaUtil: { codeBlock } } = require('../../index');

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 5,
			description: (language) => language.get('COMMAND_REASON_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_REASON_EXTENDED'),
			name: 'reason',
			permissionLevel: 5,
			runIn: ['text'],
			usage: '<latest|case:integer> <reason:...string>',
			usageDelim: ' '
		});
	}

	public async run(msg, [selected, reason]) {
		if (!reason) reason = null;

		// Get all cases
		if (selected === 'latest') selected = await msg.guild.moderation.count();
		const modlog = await msg.guild.moderation.fetch(selected);
		if (!modlog) throw msg.language.get('COMMAND_REASON_NOT_EXISTS');

		const oldReason = modlog.reason;

		// Update the moderation case
		await modlog.edit({ [SCHEMA_KEYS.REASON]: reason });

		const channelID = msg.guild.settings.channels.modlog;
		if (channelID) {
			const channel = msg.guild.channels.get(msg.guild.settings.channels.modlog);
			if (channel) {
				// Fetch the message to edit it
				const messages = await channel.messages.fetch({ limit: 100 });
				const message = messages.find((mes) => mes.author.id === this.client.user.id
					&& mes.embeds.length > 0
					&& mes.embeds[0].type === 'rich'
					&& mes.embeds[0].footer && mes.embeds[0].footer.text === `Case ${selected}`
				);

				await (message ? message.edit(await modlog.prepareEmbed()) : channel.send(await modlog.prepareEmbed()));
			} else {
				await msg.guild.settings.reset('channels.mod');
			}
		}

		return msg.alert(`Successfully updated the log ${selected}.${codeBlock('http', [
			`Old reason : ${oldReason || 'Not set.'}`,
			`New reason : ${modlog.reason}`
		].join('\n'))}`);
	}

};
