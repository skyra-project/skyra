import { MessageEmbed, TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { RCursor } from 'rethinkdb-ts';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { StarboardMessageData } from '../../lib/structures/StarboardMessage';
import { Databases } from '../../lib/types/constants/Constants';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';

const MEDALS = ['🥇', '🥈', '🥉'];

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: [],
			cooldown: 10,
			description: language => language.get('COMMAND_STAR_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_STAR_EXTENDED'),
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
			.getAll(message.guild!.id, { index: 'guildID' })
			.filter(r.row('starMessageID').ne(null))
			.sample(1)
			.nth(0)
			.default(null)
			.run() as StarboardMessageData;

		// If there is no starboard message, return no stars
		if (!starboardData) return message.sendLocale('COMMAND_STAR_NOSTARS');

		// If there is no configured starboard channel, return no stars
		// TODO(kyranet): Change this to a more descriptive message
		const starboardChannelID = message.guild!.settings.get(GuildSettings.Starboard.Channel) as GuildSettings.Starboard.Channel;
		if (!starboardChannelID) return message.sendLocale('COMMAND_STAR_NOSTARS');

		// If there is no configured starboard channel, return no stars
		// TODO(kyranet): Change this to a more descriptive message
		const starboardChannel = message.guild!.channels.get(starboardChannelID) as TextChannel;
		if (!starboardChannel) {
			await message.guild!.settings.reset(GuildSettings.Starboard.Channel);
			return message.sendLocale('COMMAND_STAR_NOSTARS');
		}

		// If the channel the message was starred from does not longer exist, delete
		const starredMessageChannel = message.guild!.channels.get(starboardData.channelID) as TextChannel;
		if (!starredMessageChannel) {
			await this.client.providers.default.db.table(Databases.Starboard).get(starboardData.id).delete()
				.run();
			return this.random(message);
		}

		// If the starred message does not longer exist in the starboard channel, assume it was deleted by a
		// moderator, therefore delete it from database and search another
		const starredMessage = await starboardChannel.messages.fetch(starboardData.starMessageID!).catch(() => null);
		if (!starredMessage) {
			await this.client.providers.default.db.table(Databases.Starboard).get(starboardData.id).delete()
				.run();
			return this.random(message);
		}

		return message.sendMessage(starredMessage.content, starredMessage.embeds[0]);
	}

	public async top(message: KlasaMessage) {
		const r = this.client.providers.default.db;
		const starboardMessages = await r
			.table(Databases.Starboard)
			.getAll(message.guild!.id, { index: 'guildID' })
			.filter(r.row('starMessageID').ne(null))
			.pluck('messageID', 'userID', 'stars')
			.getCursor() as RCursor<StarPluck>;

		let totalStars = 0;
		const topMessages: [string, number][] = [];
		const topReceivers: Map<string, number> = new Map();

		const min = message.guild!.settings.get(GuildSettings.Starboard.Minimum) as GuildSettings.Starboard.Minimum;

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
		if (stars < 100) return '✨';
		if (stars < 200) return '🌠';
		return '🌌';
	}

}

interface StarPluck {
	messageID: string;
	userID: string;
	stars: number;
}
