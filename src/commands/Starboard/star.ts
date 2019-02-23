import { MessageEmbed, TextChannel } from 'discord.js';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { RCursor } from 'rethinkdb-ts';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { COLORS } from '../../lib/structures/StarboardMessage';
import { Databases } from '../../lib/types/constants/Constants';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { getContent, getImage } from '../../lib/util/util';

const MEDALS = ['🥇', '🥈', '🥉'];

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
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

	public async random(message: KlasaMessage) {
		const r = this.client.providers.default.db;
		const starboardData = await r
			.table(Databases.Starboard)
			.getAll(message.guild.id, { index: 'guildID' })
			.filter(r.row('starMessageID').ne(null))
			.sample(1)
			.nth(0)
			.default(null)
			.run();

		if (!starboardData) return message.sendLocale('COMMAND_STAR_NOMESSAGE');

		const channel = message.guild.channels.get(starboardData.channelID) as TextChannel;
		if (!channel) {
			await this.client.providers.default.db.table(Databases.Starboard).get(starboardData.id).delete().run();
			return this.random(message);
		}
		const starredMessage = await channel.messages.fetch(starboardData.messageID).catch(() => null);
		if (!starredMessage) {
			await this.client.providers.default.db.table(Databases.Starboard).get(starboardData.id).delete().run();
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

	public async top(message: KlasaMessage) {
		const starboardMessages = await this.client.providers.default.db
			.table(Databases.Starboard)
			.getAll(message.guild.id, { index: 'guildID' })
			.pluck('messageID', 'userID', 'stars')
			.getCursor() as RCursor<StarPluck>;

		let totalStars = 0;
		const topMessages = [];
		const topReceivers = new Map();

		const min = message.guild.settings.get(GuildSettings.Starboard.Minimum) as GuildSettings.Starboard.Minimum;

		for await (const starboardMessage of starboardMessages as unknown as AsyncIterable<StarPluck>) {
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
			.setColor(0xFFD000)
			.addField(i18n('COMMAND_STAR_STATS'), i18n('COMMAND_STAR_STATS_DESCRIPTION', totalMessages, totalStars))
			.addField(i18n('COMMAND_STAR_TOPSTARRED'), topThreeMessages.map(([mID, stars], index) => i18n('COMMAND_STAR_TOPSTARRED_DESCRIPTION', MEDALS[index], mID, stars)))
			.addField(i18n('COMMAND_STAR_TOPRECEIVERS'), topThreeReceivers.map(([uID, stars], index) => i18n('COMMAND_STAR_TOPRECEIVERS_DESCRIPTION', MEDALS[index], uID, stars)))
			.setTimestamp());
	}

	public _getEmoji(starboardData: StarPluck) {
		const { stars } = starboardData;
		if (stars < 5) return '⭐';
		if (stars < 10) return '🌟';
		if (stars < 25) return '💫';
		return '✨';
	}

}

interface StarPluck {
	messageID: string;
	userID: string;
	stars: number;
}
