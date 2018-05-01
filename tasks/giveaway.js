const { Task, klasaUtil: { sleep }, MessageEmbed, klasaUtil: { codeBlock } } = require('../index');

module.exports = class extends Task {

	async run(data) {
		try {
			const guild = this.client.guilds.get(data.guildID);
			if (!guild) return;

			const channel = guild.channels.get(data.channelID);
			if (!channel) return;

			const [message, author] = await Promise.all([
				channel.messages.fetch(data.messageID),
				this.client.users.fetch(data.userID)
			]);

			const reaction = message.reactions.get('🎉');
			if (!reaction) return;

			await this._countdown(data, author, guild, channel, message, reaction);
		} catch (_) {
			// Ignored
		}
	}

	async _countdown({ id, title, timestamp }, author, guild, channel, message, reaction) {
		const { language } = guild;
		const ends = new Date(timestamp + 20000);
		const embed = new MessageEmbed()
			.setColor(0xE64700)
			.setTitle(title)
			.setDescription(language.get('GIVEAWAY_LASTCHANCE', 20000))
			.setFooter(language.get('GIVEAWAY_ENDS_AT'))
			.setTimestamp(ends);

		await this._finalCountdown(embed, message, ends, language);

		const users = await reaction.users.fetch();
		users.delete(this.client.user.id);
		if (users.size === 0) {
			await this._endNoWinner({ id, title }, message, author, language, embed);
			return;
		}

		const amount = Math.min(users.size, 11);
		const winners = users.random(amount);
		const winner = winners[0];

		embed.setColor(0xFF7749)
			.setDescription(language.get('GIVEAWAY_ENDED', winner))
			.setFooter(language.get('GIVEAWAY_ENDED_AT'));

		await message.edit(language.get('GIVEAWAY_ENDED_TITLE'), { embed });
		await channel.send(language.get('GIVEAWAY_ENDED_MESSAGE', winner, title));

		const content = winners.size === 1
			? language.get('GIVEAWAY_ENDED_DIRECT_MESSAGE_ONLY_WINNER', title, id, winner)
			: language.get('GIVEAWAY_ENDED_DIRECT_MESSAGE', title, id, winner, amount - 1, codeBlock('asciidoc',
				winners.slice(1).map(user => `${user.id.padEnd(18, ' ')} :: ${user.tag}`).join('\n')));

		await author.send(content);
	}

	async _endNoWinner({ id, title }, message, author, language, embed) {
		embed.setColor(0xFF7749)
			.setDescription(language.get('GIVEWAWY_ENDED_NO_WINNER'))
			.setFooter(language.get('GIVEAWAY_ENDED_AT'));

		await message.edit(language.get('GIVEAWAY_ENDED_TITLE'), { embed });
		await author.send(language.get('GIVEAWAY_ENDED_DIRECT_MESSAGE_NO_WINNER', title, id));
	}

	async _finalCountdown(embed, message, ends, language) {
		const LASTCHANCE_TITLE = language.get('GIVEAWAY_LASTCHANCE_TITLE');

		message.edit(LASTCHANCE_TITLE, { embed });
		await sleep(10000);
		embed.setDescription(language.get('GIVEAWAY_LASTCHANCE', 10000));
		message.edit(LASTCHANCE_TITLE, { embed });
		await sleep(6000);

		let offset = 0;
		for (const remaining of [3000, 2000, 1000]) {
			await sleep(1000 - offset);

			// Send the message and substract the latency
			const now = Date.now();
			await message.edit(LASTCHANCE_TITLE, { embed: embed.setDescription(language.get('GIVEAWAY_LASTCHANCE', remaining)) });
			offset = Date.now() - now;
		}
	}

};
