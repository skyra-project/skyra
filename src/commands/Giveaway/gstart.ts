const { Command, MessageEmbed } = require('../../index');

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			runIn: ['text'],
			aliases: ['giveaway'],
			requiredPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
			description: (language) => language.get('COMMAND_GIVEAWAY_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_GIVEAWAY_EXTENDED'),
			usage: '<time:time> <title:string{1,256}> [...]',
			usageDelim: ' '
		});
	}

	public async run(msg, [time, ...rawTitle]) {
		const offset = time.getTime() - Date.now();

		// A little margin of error
		if (offset < 59900) throw msg.language.get('GIVEAWAY_TIME');
		const title = rawTitle.length > 0 ? rawTitle.join(' ') : null;
		const date = new Date(offset + Date.now() - 20000);

		let message;
		try {
			message = await msg.channel.send(msg.language.get('GIVEAWAY_TITLE'), {
				embed: new MessageEmbed()
					.setColor(0x49C6F7)
					.setTitle(title)
					.setDescription(msg.language.get('GIVEAWAY_DURATION', offset))
					.setFooter(msg.language.get('GIVEAWAY_ENDS_AT'))
					.setTimestamp(date)
			});
			await message.react('🎉');
		} catch (_) {
			return null;
		}

		const { id } = await this.client.schedule.create('giveaway', date, {
			catchUp: true,
			data: {
				timestamp: date.getTime() + 20000,
				guildID: msg.guild.id,
				channelID: msg.channel.id,
				messageID: message.id,
				userID: msg.author.id,
				title
			}
		});

		await msg.author.send(msg.language.get('GIVEAWAY_START_DIRECT_MESSAGE', title, id)).catch(() => null);
		return message;
	}

};
