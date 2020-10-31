import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { Colors } from '@lib/types/constants/Constants';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';

const MEDALS = ['🥇', '🥈', '🥉'];

@ApplyOptions<SkyraCommandOptions>({
	aliases: [],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Starboard.StarDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Starboard.StarExtended),
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	subcommands: true,
	usage: '(top|random:default) [user:membername{2}] (duration:timespan)',
	usageDelim: ' '
})
@CreateResolvers([
	[
		'timespan',
		(arg, possible, message, [subcommand]) => {
			if (!arg || subcommand === 'random') return undefined;
			return message.client.arguments.get('timespan')!.run(arg, possible, message);
		}
	]
])
export default class extends SkyraCommand {
	public async random(message: GuildMessage, [member]: [GuildMember?]): Promise<Message | Message[]> {
		const minimum = await message.guild.readSettings(GuildSettings.Starboard.Minimum);
		const { starboards } = await DbSet.connect();
		const qb = starboards
			.createQueryBuilder()
			.select()
			.where('guild_id = :id', { id: message.guild!.id })
			.andWhere('star_message_id IS NOT NULL')
			.andWhere('enabled = TRUE')
			.andWhere('stars >= :minimum', { minimum });

		if (member) qb.andWhere('user_id = :user', { user: member.id });

		const starboardData = await qb.orderBy('RANDOM()').limit(1).getOne();

		// If there is no starboard message, return no stars
		if (!starboardData) return message.sendLocale(LanguageKeys.Commands.Starboard.StarNostars);

		// If there is no configured starboard channel, return no stars
		// TODO(kyranet): Change this to a more descriptive message
		const starboardChannelID = await message.guild.readSettings(GuildSettings.Starboard.Channel);
		if (!starboardChannelID) return message.sendLocale(LanguageKeys.Commands.Starboard.StarNostars);

		// If there is no configured starboard channel, return no stars
		// TODO(kyranet): Change this to a more descriptive message
		const starboardChannel = message.guild!.channels.cache.get(starboardChannelID) as TextChannel;
		if (!starboardChannel) {
			await message.guild.writeSettings([[GuildSettings.Starboard.Channel, null]]);
			return message.sendLocale(LanguageKeys.Commands.Starboard.StarNostars);
		}

		// If the channel the message was starred from does not longer exist, delete
		const starredMessageChannel = message.guild!.channels.cache.get(starboardData.channelID) as TextChannel;
		if (!starredMessageChannel) {
			await starboardData.remove();
			return this.random(message, [member]);
		}

		// If the starred message does not longer exist in the starboard channel, assume it was deleted by a
		// moderator, therefore delete it from database and search another
		const starredMessage = await starboardChannel.messages.fetch(starboardData.starMessageID!).catch(() => null);
		if (!starredMessage) {
			await starboardData.remove();
			return this.random(message, [member]);
		}

		return message.sendMessage(starredMessage.content, starredMessage.embeds[0]);
	}

	public async top(message: GuildMessage, [member, timespan]: [GuildMember?, number?]) {
		const minimum = await message.guild.readSettings(GuildSettings.Starboard.Minimum);
		const { starboards } = await DbSet.connect();
		const qb = starboards
			.createQueryBuilder()
			.select()
			.where('guild_id = :id', { id: message.guild!.id })
			.andWhere('star_message_id IS NOT NULL')
			.andWhere('enabled = TRUE')
			.andWhere('stars >= :minimum', { minimum });

		if (member) qb.andWhere('user_id = :user', { user: member.id });

		const starboardMessages = await qb.getMany();
		if (starboardMessages.length === 0) return message.sendLocale(LanguageKeys.Commands.Starboard.StarNostars);

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
			const maskedUrl = `[${await message.fetchLocale(LanguageKeys.Misc.JumpTo)}](${url})`;
			topMessages.push([maskedUrl, starboardMessage.stars]);
			topReceivers.set(starboardMessage.userID, (topReceivers.get(starboardMessage.userID) || 0) + starboardMessage.stars);
			totalStars += starboardMessage.stars;
		}

		if (totalStars === 0) return message.sendLocale(LanguageKeys.Commands.Starboard.StarNostars);

		const totalMessages = topMessages.length;
		const topThreeMessages = topMessages.sort((a, b) => (a[1] > b[1] ? -1 : 1)).slice(0, 3);
		const topThreeReceivers = [...topReceivers].sort((a, b) => (a[1] > b[1] ? -1 : 1)).slice(0, 3);

		const i18n = await message.fetchLanguage();
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(Colors.Amber)
				.addField(
					i18n.get(LanguageKeys.Commands.Starboard.StarStats),
					i18n.get(LanguageKeys.Commands.Starboard.StarStatsDescription, {
						messages: i18n.get(
							totalMessages === 1 ? LanguageKeys.Commands.Starboard.StarMessages : LanguageKeys.Commands.Starboard.StarMessagesPlural,
							{ count: totalMessages }
						),
						stars: i18n.get(totalStars === 1 ? LanguageKeys.Commands.Starboard.Stars : LanguageKeys.Commands.Starboard.StarsPlural, {
							count: totalStars
						})
					})
				)
				.addField(
					i18n.get(LanguageKeys.Commands.Starboard.StarTopstarred),
					topThreeMessages.map(([mID, stars], index) =>
						i18n.get(
							stars === 1
								? LanguageKeys.Commands.Starboard.StarTopstarredDescription
								: LanguageKeys.Commands.Starboard.StarTopstarredDescriptionPlural,
							{
								medal: MEDALS[index],
								id: mID,
								count: stars
							}
						)
					)
				)
				.addField(
					i18n.get(LanguageKeys.Commands.Starboard.StarTopreceivers),
					topThreeReceivers.map(([uID, stars], index) =>
						i18n.get(
							stars === 1
								? LanguageKeys.Commands.Starboard.StarTopreceiversDescription
								: LanguageKeys.Commands.Starboard.StarTopreceiversDescriptionPlural,
							{
								medal: MEDALS[index],
								id: uID,
								count: stars
							}
						)
					)
				)
				.setTimestamp()
		);
	}

	private decodeSnowflake(snowflake: string) {
		return (BigInt(snowflake) >> 22n) + 1420070400000n;
	}

	private makeStarLink(guildID: string, channeLID: string, messageID: string) {
		return `https://discord.com/channels/${guildID}/${channeLID}/${messageID}`;
	}
}
