import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { Colors } from '@lib/types/constants/Constants';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { KeyedMemberTag } from '@root/arguments/membername';
import { ApplyOptions, CreateResolvers } from '@skyra/decorators';
import { MessageEmbed, TextChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

const MEDALS = ['🥇', '🥈', '🥉'];

@ApplyOptions<SkyraCommandOptions>({
	aliases: [],
	cooldown: 10,
	description: (language) => language.tget('COMMAND_STAR_DESCRIPTION'),
	extendedHelp: (language) => language.tget('COMMAND_STAR_EXTENDED'),
	requiredPermissions: ['EMBED_LINKS'],
	requiredSettings: [],
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
	public async random(message: KlasaMessage, [user]: [KeyedMemberTag?]): Promise<KlasaMessage | KlasaMessage[]> {
		const minimum = message.guild!.settings.get(GuildSettings.Starboard.Minimum);
		const { starboards } = await DbSet.connect();
		const qb = starboards
			.createQueryBuilder()
			.select()
			.where('guild_id = :id', { id: message.guild!.id })
			.andWhere('star_message_id IS NOT NULL')
			.andWhere('enabled = TRUE')
			.andWhere('stars >= :minimum', { minimum });

		if (user) qb.andWhere('user_id = :user', { user: user.id });

		const starboardData = await qb.orderBy('RANDOM()').limit(1).getOne();

		// If there is no starboard message, return no stars
		if (!starboardData) return message.sendLocale('COMMAND_STAR_NOSTARS');

		// If there is no configured starboard channel, return no stars
		// TODO(kyranet): Change this to a more descriptive message
		const starboardChannelID = message.guild!.settings.get(GuildSettings.Starboard.Channel);
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
			await starboardData.remove();
			return this.random(message, [user]);
		}

		// If the starred message does not longer exist in the starboard channel, assume it was deleted by a
		// moderator, therefore delete it from database and search another
		const starredMessage = await starboardChannel.messages.fetch(starboardData.starMessageID!).catch(() => null);
		if (!starredMessage) {
			await starboardData.remove();
			return this.random(message, [user]);
		}

		return message.sendMessage(starredMessage.content, starredMessage.embeds[0]);
	}

	public async top(message: KlasaMessage, [user, timespan]: [KeyedMemberTag?, number?]) {
		const minimum = message.guild!.settings.get(GuildSettings.Starboard.Minimum);
		const { starboards } = await DbSet.connect();
		const qb = starboards
			.createQueryBuilder()
			.select()
			.where('guild_id = :id', { id: message.guild!.id })
			.andWhere('star_message_id IS NOT NULL')
			.andWhere('enabled = TRUE')
			.andWhere('stars >= :minimum', { minimum });

		if (user) qb.andWhere('user_id = :user', { user: user.id });

		const starboardMessages = await qb.getMany();
		if (starboardMessages.length === 0) return message.sendLocale('COMMAND_STAR_NOSTARS');

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
			const maskedUrl = `[${message.language.tget('JUMPTO')}](${url})`;
			topMessages.push([maskedUrl, starboardMessage.stars]);
			topReceivers.set(starboardMessage.userID, (topReceivers.get(starboardMessage.userID) || 0) + starboardMessage.stars);
			totalStars += starboardMessage.stars;
		}

		if (totalStars === 0) return message.sendLocale('COMMAND_STAR_NOSTARS');

		const totalMessages = topMessages.length;
		const topThreeMessages = topMessages.sort((a, b) => (a[1] > b[1] ? -1 : 1)).slice(0, 3);
		const topThreeReceivers = [...topReceivers].sort((a, b) => (a[1] > b[1] ? -1 : 1)).slice(0, 3);

		const i18n = message.language.tget.bind(message.language);
		return message.sendEmbed(
			new MessageEmbed()
				.setColor(Colors.Amber)
				.addField(i18n('COMMAND_STAR_STATS'), i18n('COMMAND_STAR_STATS_DESCRIPTION', totalMessages, totalStars))
				.addField(
					i18n('COMMAND_STAR_TOPSTARRED'),
					topThreeMessages.map(([mID, stars], index) => i18n('COMMAND_STAR_TOPSTARRED_DESCRIPTION', MEDALS[index], mID, stars))
				)
				.addField(
					i18n('COMMAND_STAR_TOPRECEIVERS'),
					topThreeReceivers.map(([uID, stars], index) => i18n('COMMAND_STAR_TOPRECEIVERS_DESCRIPTION', MEDALS[index], uID, stars))
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
