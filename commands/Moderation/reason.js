const { Command, Moderation, ModerationLog } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'reason',
			permLevel: 2,
			botPerms: ['EMBED_LINKS'],
			runIn: ['text'],
			cooldown: 5,

			description: 'Edit the reason field from a case.',
			usage: '<case:integer> <reason:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [selected, ...reason]) {
		reason = reason.length > 0 ? reason.join(' ') : null;

		if (!msg.guild.configs.channels.modlog) throw msg.language.get('GUILD_SETTINGS_CHANNELS_MOD');
		const channel = msg.guild.channels.get(msg.guild.configs.channels.modlog);
		if (!channel) {
			await msg.guild.configs.reset('channels.mod');
			throw msg.language.get('GUILD_SETTINGS_CHANNELS_MOD');
		}

		// Get all cases
		const [log] = await this.client.moderation.getCases(msg.guild, {
			[Moderation.schemaKeys.CASE]: selected
		}).catch(() => [null]);
		if (!log) throw msg.language.get('COMMAND_REASON_NOT_EXISTS');

		// Update the moderation case
		await this.client.moderation.r.table('moderation').get(log.id).update({ [Moderation.schemaKeys.REASON]: reason });

		// Fetch the message to edit it
		const messages = await channel.messages.fetch({ limit: 100 });
		const message = messages.find(mes => mes.author.id === this.client.user.id
			&& mes.embeds.length > 0
			&& mes.embeds[0].type === 'rich'
			&& mes.embeds[0].footer && mes.embeds[0].footer.text === `Case ${selected}`
		);

		if (message) {
			const embed = message.embeds[0];
			const [type, user] = embed.description.split('\n');
			embed.description = [
				type,
				user,
				`**Reason**: ${reason}`
			].join('\n');
			embed.author = {
				name: msg.author.tag,
				iconURL: msg.author.displayAvatarURL({ size: 128 })
			};
			await message.edit({ embed });
		} else {
			const dataColor = ModerationLog.TYPES[log.type];
			const user = await this.client.users.fetch(log.user).catch(() => ({ tag: 'Unknown', id: log.user }));
			const embed = new this.client.methods.Embed()
				.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ size: 128 }))
				.setColor(dataColor.color)
				.setDescription([
					`**Type**: ${dataColor.title}`,
					`**User**: ${user.tag} (${user.id})`,
					`**Reason**: ${reason}`
				].join('\n'))
				.setFooter(`Case ${selected}`)
				.setTimestamp();
			await channel.send({ embed });
		}

		return msg.alert(`Successfully updated the log ${selected}.${this.client.methods.util.codeBlock('http', [
			`Old reason : ${log.reason || 'Not set.'}`,
			`New reason : ${reason}`
		].join('\n'))}`);
	}

};
