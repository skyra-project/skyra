const { Command, constants: { MODERATION: { SCHEMA_KEYS } }, util: { parseRange } } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['EMBED_LINKS'],
			cooldown: 5,
			description: (language) => language.get('COMMAND_REASON_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_REASON_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			usage: '(cases:case) <reason:...string>',
			usageDelim: ' '
		});

		this.createCustomResolver('case', async (arg, possible, message) => {
			if (!arg) throw message.language.get('COMMAND_REASON_MISSING_CASE');
			if (arg.toLowerCase() === 'latest') return [await message.guild.moderation.count()];
			return parseRange(arg);
		});
	}

	async run(msg, [cases, reason]) {
		if (!reason) reason = null;

		const entries = await msg.guild.moderation.fetch(cases);
		if (!entries.size) throw msg.language.get('COMMAND_REASON_NOT_EXISTS', cases.length > 1);

		const channel = msg.guild.channels.get(msg.guild.settings.channels.modlog);
		const messages = channel ? await channel.messages.fetch({ limit: 100 }) : null;

		for (const [caseID, modlog] of entries.entries()) {
			// Update the moderation case
			await modlog.edit({ [SCHEMA_KEYS.REASON]: reason });

			const message = messages ? messages.find(mes => mes.author.id === this.client.user.id
					&& mes.embeds.length > 0
					&& mes.embeds[0].type === 'rich'
					&& mes.embeds[0].footer && mes.embeds[0].footer.text === `Case ${caseID}`
			) : null;

			await (message ? message.edit(await modlog.prepareEmbed()) : channel && channel.send(await modlog.prepareEmbed()));
		}

		if (!channel)
			await msg.guild.settings.reset('channels.mod');

		return msg.alert(msg.language.get('COMMAND_REASON_UPDATED', entries, reason));
	}

};
