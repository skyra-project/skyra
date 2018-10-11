const { Command, MessageEmbed, StarboardMessage: { COLORS }, util: { getImage, getContent } } = require('../../index');
const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: [],
			cooldown: 10,
			description: (language) => language.get('COMMAND_STAR_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_STAR_EXTENDED'),
			permissionLevel: 10,
			requiredPermissions: ['EMBED_LINKS'],
			requiredSettings: [],
			runIn: ['text'],
			subcommands: true,
			usage: '(top|random:default)'
		});
	}

	async random(message) {
		const starboardData = await this.client.providers.default.db
			.table('starboard')
			.getAll(message.guild.id, { index: 'guildID' })
			.sample(1)
			.nth(0)
			.default(null)
			.run();

		if (!starboardData) return message.sendLocale('COMMAND_STAR_NOMESSAGE');

		const channel = message.guild.channels.get(starboardData.channelID);
		if (!channel) {
			await this.client.providers.default.db.table('starboard').get(starboardData.id).delete().run();
			return this.random(message);
		}
		const starredMessage = await channel.messages.fetch(starboardData.messageID).catch(() => null);
		if (!message) {
			await this.client.providers.default.db.table('starboard').get(starboardData.id).delete().run();
			return this.random(message);
		}

		const title = `${this._getEmoji(starboardData)} **${starboardData.stars}** ${starredMessage.channel} ID: ${starredMessage.id}`;
		const description = getContent(starredMessage);
		const image = getImage(starredMessage);
		const embed = new MessageEmbed()
			.setURL(starredMessage.url)
			.setTitle(message.language.get('STARBOARD_JUMPTO'))
			.setAuthor(starredMessage.author.username, starredMessage.author.displayAvatarURL())
			.setColor(starboardData.stars < COLORS.length ? COLORS[starboardData.stars] : COLORS[COLORS.length - 1])
			.setTimestamp(starredMessage.createdAt);

		if (description) embed.setDescription(description);
		if (image) embed.setImage(image);
		return message.sendMessage(title, embed);
	}

	async top(message) {
		const starboardMessages = await this.client.providers.default.db
			.table('starboard')
			.getAll(message.guild.id, { index: 'guildID' })
			.pluck('messageID', 'userID', 'stars')
			.getCursor();

		let totalStars = 0;
		const topMessages = [];
		const topReceivers = new Map();

		const min = message.guild.settings.starboard.minimum;

		// @ts-ignore
		for await (const starboardMessage of starboardMessages) {
			if (starboardMessage.stars < min) continue;
			topMessages.push([starboardMessage.messageID, starboardMessage.stars]);
			topReceivers.set(starboardMessage.userID, (topReceivers.get(starboardMessage.userID) || 0) + starboardMessage.stars);
			totalStars += starboardMessage.stars;
		}

		if (totalStars === 0) return message.sendLocale('COMMAND_STAR_NOSTARS');

		const totalMessages = topMessages.length;
		const topThreeMessages = topMessages.sort((a, b) => a[1] > b[1] ? -1 : 1).slice(0, 3);
		const topThreeReceivers = [...topReceivers].sort((a, b) => a[1] > b[1] ? -1 : 1).slice(0, 3);

		const i18n = message.language.get.bind(message.language);
		return message.sendEmbed(new MessageEmbed()
			.setColor(0xffd000)
			.addField(i18n('COMMAND_STAR_STATS'), i18n('COMMAND_STAR_STATS_DESCRIPTION', totalMessages, totalStars))
			.addField(i18n('COMMAND_STAR_TOPSTARRED'), topThreeMessages.map(([mID, stars], index) => i18n('COMMAND_STAR_TOPSTARRED_DESCRIPTION', MEDALS[index], mID, stars)))
			.addField(i18n('COMMAND_STAR_TOPRECEIVERS'), topThreeReceivers.map(([uID, stars], index) => i18n('COMMAND_STAR_TOPRECEIVERS_DESCRIPTION', MEDALS[index], uID, stars)))
			.setTimestamp());
	}

	_getEmoji(starboardData) {
		const { stars } = starboardData;
		if (stars < 5) return '⭐';
		if (stars < 10) return '🌟';
		if (stars < 25) return '💫';
		return '✨';
	}

};
