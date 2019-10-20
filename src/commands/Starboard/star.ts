import { MessageEmbed, TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';

const MEDALS = ['🥇', '🥈', '🥉'];

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: [],
			cooldown: 10,
			description: language => language.tget('COMMAND_STAR_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_STAR_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			requiredSettings: [],
			runIn: ['text'],
			subcommands: true,
			usage: '(top|random:default) (duration:duration)',
			usageDelim: ' '
		});

		this.createCustomResolver('duration', (arg, possible, message, [subcommand]) => {
			if (!arg || subcommand === 'random') return undefined;
			return this.client.arguments.get('timespan').run(arg, possible, message);
		});
	}

	public async random(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const min = message.guild!.settings.get(GuildSettings.Starboard.Minimum);
		const starboardData = await this.client.queries.fetchStarRandom(message.guild!.id, min);

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
		const starredMessageChannel = message.guild!.channels.get(starboardData.channel_id) as TextChannel;
		if (!starredMessageChannel) {
			await this.client.queries.deleteStar(message.guild!.id, starboardData.message_id);
			return this.random(message);
		}

		// If the starred message does not longer exist in the starboard channel, assume it was deleted by a
		// moderator, therefore delete it from database and search another
		const starredMessage = await starboardChannel.messages.fetch(starboardData.star_message_id!).catch(() => null);
		if (!starredMessage) {
			await this.client.queries.deleteStar(message.guild!.id, starboardData.message_id);
			return this.random(message);
		}

		return message.sendMessage(starredMessage.content, starredMessage.embeds[0]);
	}

	public async top(message: KlasaMessage, [timespan]: [number?]) {
		const min = message.guild!.settings.get(GuildSettings.Starboard.Minimum);
		const starboardMessages = await this.client.queries.fetchStars(message.guild!.id, min);
		if (starboardMessages.length === 0) return message.sendLocale('COMMAND_STAR_NOSTARS');

		let totalStars = 0;
		const topMessages: [string, number][] = [];
		const topReceivers: Map<string, number> = new Map();

		const minimum = timespan ? Date.now() - timespan : null;
		for (const starboardMessage of starboardMessages) {
			if (minimum !== null) {
				const postedAt = this.decodeSnowflake(starboardMessage.star_message_id!);
				if (postedAt < minimum) continue;
			}
			const url = this.makeStarLink(starboardMessage.guild_id, starboardMessage.channel_id, starboardMessage.message_id);
			const maskedUrl = `[${message.language.tget('JUMPTO')}](${url})`;
			topMessages.push([maskedUrl, starboardMessage.stars]);
			topReceivers.set(starboardMessage.user_id, (topReceivers.get(starboardMessage.user_id) || 0) + starboardMessage.stars);
			totalStars += starboardMessage.stars;
		}

		if (totalStars === 0) return message.sendLocale('COMMAND_STAR_NOSTARS');

		const totalMessages = topMessages.length;
		const topThreeMessages = topMessages.sort((a, b) => a[1] > b[1] ? -1 : 1).slice(0, 3);
		const topThreeReceivers = [...topReceivers].sort((a, b) => a[1] > b[1] ? -1 : 1).slice(0, 3);

		const i18n = message.language.tget.bind(message.language);
		return message.sendEmbed(new MessageEmbed()
			.setColor(0xFFD000)
			.addField(i18n('COMMAND_STAR_STATS'), i18n('COMMAND_STAR_STATS_DESCRIPTION', totalMessages, totalStars))
			.addField(i18n('COMMAND_STAR_TOPSTARRED'), topThreeMessages.map(([mID, stars], index) => i18n('COMMAND_STAR_TOPSTARRED_DESCRIPTION', MEDALS[index], mID, stars)))
			.addField(i18n('COMMAND_STAR_TOPRECEIVERS'), topThreeReceivers.map(([uID, stars], index) => i18n('COMMAND_STAR_TOPRECEIVERS_DESCRIPTION', MEDALS[index], uID, stars)))
			.setTimestamp());
	}

	private decodeSnowflake(snowflake: string) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2737
		// eslint-disable-next-line no-undef
		return (BigInt(snowflake) >> 22n) + 1420070400000n;
	}

	private makeStarLink(guildID: string, channeLID: string, messageID: string) {
		return `https://canary.discordapp.com/channels/${guildID}/${channeLID}/${messageID}`;
	}

}
