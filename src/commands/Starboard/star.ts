import { DbSet, GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Colors } from '#lib/types/Constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed, TextChannel, User } from 'discord.js';
import type { TFunction } from 'i18next';

const MEDALS = ['🥇', '🥈', '🥉'];

@ApplyOptions<SkyraCommand.Options>({
	aliases: [],
	cooldown: 10,
	description: LanguageKeys.Commands.Starboard.StarDescription,
	extendedHelp: LanguageKeys.Commands.Starboard.StarExtended,
	permissions: ['EMBED_LINKS'],
	runIn: ['text'],
	subCommands: ['top', { input: 'random', default: true }]
})
export class UserCommand extends SkyraCommand {
	public async random(message: GuildMessage, args: SkyraCommand.Args): Promise<Message | Message[]> {
		const user = args.finished ? null : await args.pick('userName');
		return this.handleRandom(message, user, args.t);
	}

	public async top(message: GuildMessage, args: SkyraCommand.Args) {
		const user = args.finished ? null : await args.pick('userName');
		const timespan = args.finished ? null : await args.pick('timespan');

		const minimum = await message.guild.readSettings(GuildSettings.Starboard.Minimum);

		const { starboards } = this.context.db;
		const qb = starboards
			.createQueryBuilder()
			.select()
			.where('guild_id = :id', { id: message.guild.id })
			.andWhere('star_message_id IS NOT NULL')
			.andWhere('enabled = TRUE')
			.andWhere('stars >= :minimum', { minimum });

		if (user) qb.andWhere('user_id = :user', { user: user.id });

		const starboardMessages = await qb.getMany();
		if (starboardMessages.length === 0) return message.send(args.t(LanguageKeys.Commands.Starboard.StarNoStars));

		let totalStars = 0;
		const topMessages: [string, number][] = [];
		const topReceivers: Map<string, number> = new Map();

		const minimumPostedAt = timespan ? Date.now() - timespan : null;
		for (const starboardMessage of starboardMessages) {
			if (minimumPostedAt !== null) {
				const postedAt = this.decodeSnowflake(starboardMessage.starMessageID!);
				if (postedAt < minimumPostedAt) continue;
			}
			const url = this.makeStarLink(starboardMessage.guildID, starboardMessage.channelID, starboardMessage.messageID);
			const maskedUrl = `[${args.t(LanguageKeys.Misc.JumpTo)}](${url})`;
			topMessages.push([maskedUrl, starboardMessage.stars]);
			topReceivers.set(starboardMessage.userID, (topReceivers.get(starboardMessage.userID) || 0) + starboardMessage.stars);
			totalStars += starboardMessage.stars;
		}

		if (totalStars === 0) return message.send(args.t(LanguageKeys.Commands.Starboard.StarNoStars));

		const totalMessages = topMessages.length;
		const topThreeMessages = topMessages.sort((a, b) => (a[1] > b[1] ? -1 : 1)).slice(0, 3);
		const topThreeReceivers = [...topReceivers].sort((a, b) => (a[1] > b[1] ? -1 : 1)).slice(0, 3);

		return message.send(
			new MessageEmbed()
				.setColor(Colors.Amber)
				.addField(
					args.t(LanguageKeys.Commands.Starboard.StarStats),
					args.t(LanguageKeys.Commands.Starboard.StarStatsDescription, {
						messages: args.t(LanguageKeys.Commands.Starboard.StarMessages, { count: totalMessages }),
						stars: args.t(LanguageKeys.Commands.Starboard.Stars, { count: totalStars })
					})
				)
				.addField(
					args.t(LanguageKeys.Commands.Starboard.StarTopStarred),
					topThreeMessages.map(([mID, stars], index) =>
						args.t(LanguageKeys.Commands.Starboard.StarTopStarredDescription, {
							medal: MEDALS[index],
							id: mID,
							count: stars
						})
					)
				)
				.addField(
					args.t(LanguageKeys.Commands.Starboard.StarTopReceivers),
					topThreeReceivers.map(([uID, stars], index) =>
						args.t(LanguageKeys.Commands.Starboard.StarTopReceiversDescription, {
							medal: MEDALS[index],
							id: uID,
							count: stars
						})
					)
				)
				.setTimestamp()
		);
	}

	private async handleRandom(message: GuildMessage, user: User | null, t: TFunction): Promise<Message | Message[]> {
		const [minimum, starboardChannelID] = await message.guild.readSettings([GuildSettings.Starboard.Minimum, GuildSettings.Starboard.Channel]);

		// If there is no configured starboard channel, return no stars
		if (!starboardChannelID) return message.send(t(LanguageKeys.Commands.Starboard.StarNoChannel));

		const { starboards } = this.context.db;
		const qb = starboards
			.createQueryBuilder()
			.select()
			.where('guild_id = :id', { id: message.guild.id })
			.andWhere('star_message_id IS NOT NULL')
			.andWhere('enabled = TRUE')
			.andWhere('stars >= :minimum', { minimum });

		if (user) qb.andWhere('user_id = :user', { user: user.id });

		const starboardData = await qb.orderBy('RANDOM()').limit(1).getOne();

		// If there is no starboard message, return no stars
		if (!starboardData) return message.send(t(LanguageKeys.Commands.Starboard.StarNoStars));

		// If there is no configured starboard channel, return no stars
		const starboardChannel = message.guild.channels.cache.get(starboardChannelID) as TextChannel;
		if (!starboardChannel) {
			await message.guild.writeSettings([[GuildSettings.Starboard.Channel, null]]);
			return message.send(t(LanguageKeys.Commands.Starboard.StarNoChannel));
		}

		// If the channel the message was starred from does not longer exist, delete
		const starredMessageChannel = message.guild.channels.cache.get(starboardData.channelID) as TextChannel;
		if (!starredMessageChannel) {
			await starboardData.remove();
			return this.handleRandom(message, user, t);
		}

		// If the starred message does not longer exist in the starboard channel, assume it was deleted by a
		// moderator, therefore delete it from database and search another
		const starredMessage = await starboardChannel.messages.fetch(starboardData.starMessageID!).catch(() => null);
		if (!starredMessage) {
			await starboardData.remove();
			return this.handleRandom(message, user, t);
		}

		return message.send(starredMessage.content, starredMessage.embeds[0]);
	}

	private decodeSnowflake(snowflake: string) {
		return (BigInt(snowflake) >> 22n) + 1420070400000n;
	}

	private makeStarLink(guildID: string, channeLID: string, messageID: string) {
		return `https://discord.com/channels/${guildID}/${channeLID}/${messageID}`;
	}
}
