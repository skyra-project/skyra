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
			usage: '(top|random:default) (duration:timespan)',
			usageDelim: ' '
		});

		this.createCustomResolver('duration', (arg, possible, message, [subcommand]) => {
			if (!arg || subcommand === 'random') return undefined;
			return this.client.arguments.get('timespan').run(arg, possible, message);
		});
	}

	public async random(message: KlasaMessage) {
		const min = message.guild!.settings.get(GuildSettings.Starboard.Minimum) as GuildSettings.Starboard.Minimum;
		const r = this.client.providers.default.db;
		const starboardData = await r
			.table<StarboardMessageData>(Databases.Starboard)
			.getAll(message.guild!.id, { index: 'guildID' })
			.filter(starMessage => r.and(
				starMessage('starMessageID').ne(null),
				starMessage('disabled').ne(true),
				starMessage('stars').ge(min)
			))
			.sample(1)
			.nth(0)
			.default(null)
			.run();

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

	public async top(message: KlasaMessage, [timespan]: [number?]) {
		const min = message.guild!.settings.get(GuildSettings.Starboard.Minimum) as GuildSettings.Starboard.Minimum;
		const r = this.client.providers.default.db;
		const starboardMessages = await r
			.table<StarboardMessageData>(Databases.Starboard)
			.getAll(message.guild!.id, { index: 'guildID' })
			.filter(starMessage => r.and(
				starMessage('starMessageID').ne(null),
				starMessage('disabled').ne(true),
				starMessage('stars').ge(min)
			))
			.pluck('messageID', 'guildID', 'channelID', 'starMessageID', 'userID', 'stars')
			.getCursor() as RCursor<StarPluck>;

		let totalStars = 0;
		const topMessages: [string, number][] = [];
		const topReceivers: Map<string, number> = new Map();

		const minimum = timespan ? Date.now() - timespan : null;
		for await (const starboardMessage of starboardMessages as unknown as AsyncIterable<StarPluck>) {
			if (minimum) {
				const postedAt = this.decodeSnowflake(starboardMessage.starMessageID);
				if (postedAt < minimum) continue;
			}
			const url = this.makeStarLink(starboardMessage.guildID, starboardMessage.channelID, starboardMessage.messageID);
			const maskedUrl = `[${message.language.get('JUMPTO')}](${url})`;
			topMessages.push([maskedUrl, starboardMessage.stars]);
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

	private decodeSnowflake(snowflake: string) {
		// eslint-disable-next-line no-undef
		return (BigInt(snowflake) >> 22n) + 1420070400000n;
	}

	private makeStarLink(guildID: string, channeLID: string, messageID: string) {
		return `https://canary.discordapp.com/channels/${guildID}/${channeLID}/${messageID}`;
	}

}

interface StarPluck {
	messageID: string;
	guildID: string;
	channelID: string;
	starMessageID: string;
	userID: string;
	stars: number;
}
