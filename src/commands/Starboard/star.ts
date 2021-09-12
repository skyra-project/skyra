import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { days } from '#utils/common';
import { Colors } from '#utils/constants';
import { getStarboard } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/payloads/v9';
import { Message, MessageEmbed, TextChannel, User } from 'discord.js';
import type { TFunction } from 'i18next';

const MEDALS = ['🥇', '🥈', '🥉'];

@ApplyOptions<SkyraCommand.Options>({
	aliases: [],
	description: LanguageKeys.Commands.Starboard.StarDescription,
	extendedHelp: LanguageKeys.Commands.Starboard.StarExtended,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subCommands: ['top', { input: 'random', default: true }]
})
export class UserCommand extends SkyraCommand {
	public async random(message: GuildMessage, args: SkyraCommand.Args): Promise<Message | Message[]> {
		const user = args.finished ? null : await args.pick('userName');
		return this.handleRandom(message, user, args.t);
	}

	public async top(message: GuildMessage, args: SkyraCommand.Args) {
		const user = args.finished ? null : await args.pick('userName');
		const timespan = args.finished ? null : await args.pick('timespan', { minimum: days(1) });

		const minimum = await readSettings(message.guild, GuildSettings.Starboard.Minimum);

		const { starboards } = this.container.db;
		const qb = starboards
			.createQueryBuilder()
			.select()
			.where('guild_id = :id', { id: message.guild.id })
			.andWhere('star_message_id IS NOT NULL')
			.andWhere('enabled = TRUE')
			.andWhere('stars >= :minimum', { minimum });

		if (user) qb.andWhere('user_id = :user', { user: user.id });

		const starboardMessages = await qb.getMany();
		if (starboardMessages.length === 0) {
			this.error(LanguageKeys.Commands.Starboard.StarNoStars);
		}

		let totalStars = 0;
		const topMessages: [string, number][] = [];
		const topReceivers: Map<string, number> = new Map();

		const minimumPostedAt = timespan ? Date.now() - timespan : null;
		for (const starboardMessage of starboardMessages) {
			if (minimumPostedAt !== null) {
				const postedAt = this.decodeSnowflake(starboardMessage.starMessageId!);
				if (postedAt < minimumPostedAt) continue;
			}
			const url = this.makeStarLink(starboardMessage.guildId, starboardMessage.channelId, starboardMessage.messageId);
			const maskedUrl = `[${args.t(LanguageKeys.Misc.JumpTo)}](${url})`;
			topMessages.push([maskedUrl, starboardMessage.stars]);
			topReceivers.set(starboardMessage.userId, (topReceivers.get(starboardMessage.userId) || 0) + starboardMessage.stars);
			totalStars += starboardMessage.stars;
		}

		if (totalStars === 0) {
			this.error(LanguageKeys.Commands.Starboard.StarNoStars);
		}

		const totalMessages = topMessages.length;
		const topThreeMessages = topMessages.sort((a, b) => (a[1] > b[1] ? -1 : 1)).slice(0, 3);
		const topThreeReceivers = [...topReceivers].sort((a, b) => (a[1] > b[1] ? -1 : 1)).slice(0, 3);

		const statsDescription = args.t(LanguageKeys.Commands.Starboard.StarStatsDescription, {
			messages: args.t(LanguageKeys.Commands.Starboard.StarMessages, { count: totalMessages }),
			stars: args.t(LanguageKeys.Commands.Starboard.Stars, { count: totalStars })
		});

		const embedTopStarred = topThreeMessages
			.map(([messageId, stars], index) =>
				args.t(LanguageKeys.Commands.Starboard.StarTopStarredDescription, {
					medal: MEDALS[index],
					id: messageId,
					count: stars
				})
			)
			.join('\n');

		const embedTopReceivers = topThreeReceivers
			.map(([userId, stars], index) =>
				args.t(LanguageKeys.Commands.Starboard.StarTopReceiversDescription, {
					medal: MEDALS[index],
					id: userId,
					count: stars
				})
			)
			.join('\n');

		const embed = new MessageEmbed()
			.setColor(Colors.Amber)
			.addField(args.t(LanguageKeys.Commands.Starboard.StarStats), statsDescription)
			.addField(args.t(LanguageKeys.Commands.Starboard.StarTopStarred), embedTopStarred)
			.addField(args.t(LanguageKeys.Commands.Starboard.StarTopReceivers), embedTopReceivers)
			.setTimestamp();
		return send(message, { embeds: [embed] });
	}

	private async handleRandom(message: GuildMessage, user: User | null, t: TFunction): Promise<Message | Message[]> {
		const [minimum, starboardChannelId] = await readSettings(message.guild, [GuildSettings.Starboard.Minimum, GuildSettings.Starboard.Channel]);

		// If there is no configured starboard channel, return no stars
		if (!starboardChannelId) {
			this.error(LanguageKeys.Commands.Starboard.StarNoChannel);
		}

		const { starboards } = this.container.db;
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
		if (!starboardData) {
			this.error(LanguageKeys.Commands.Starboard.StarNoStars);
		}

		// Set up the starboard entry
		starboardData.setup(getStarboard(message.guild));

		// If there is no configured starboard channel, return no stars
		const starboardChannel = message.guild.channels.cache.get(starboardChannelId) as TextChannel;
		if (!starboardChannel) {
			await writeSettings(message.guild, [[GuildSettings.Starboard.Channel, null]]);
			this.error(LanguageKeys.Commands.Starboard.StarNoChannel);
		}

		// If the channel the message was starred from does not longer exist, delete
		const starredMessageChannel = message.guild.channels.cache.get(starboardData.channelId) as TextChannel;
		if (!starredMessageChannel) {
			await starboardData.remove();
			return this.handleRandom(message, user, t);
		}

		// If the starred message does not longer exist in the starboard channel, assume it was deleted by a
		// moderator, therefore delete it from database and search another
		const starredMessage = await starboardChannel.messages.fetch(starboardData.starMessageId!).catch(() => null);
		if (!starredMessage) {
			await starboardData.remove();
			return this.handleRandom(message, user, t);
		}

		return send(message, { content: starredMessage.content, embeds: starredMessage.embeds });
	}

	private decodeSnowflake(snowflake: string) {
		return (BigInt(snowflake) >> 22n) + 1420070400000n;
	}

	private makeStarLink(guildId: string, channelId: string, messageId: string) {
		return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
	}
}
