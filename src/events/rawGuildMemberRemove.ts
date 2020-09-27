import { SkyraGuild } from '@lib/extensions/SkyraGuild';
import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { DiscordEvents } from '@lib/types/Events';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { MessageLogsEnum, Moderation } from '@utils/constants';
import { getDisplayAvatar } from '@utils/util';
import { APIUser, GatewayGuildMemberRemoveDispatch } from 'discord-api-types/v6';
import { Guild, GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { Event, EventStore } from 'klasa';

const enum Matches {
	Guild = '%GUILD%',
	Member = '%MEMBER%',
	MemberName = '%MEMBERNAME%',
	MemberTag = '%MEMBERTAG%'
}

export default class extends Event {
	private readonly kTransformMessageRegExp = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%/g;

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: DiscordEvents.GuildMemberRemove, emitter: store.client.ws });
	}

	public async run(data: GatewayGuildMemberRemoveDispatch['d']) {
		const guild = this.client.guilds.cache.get(data.guild_id);
		if (!guild || !guild.available) return;

		if (guild.security.raid.has(data.user.id)) guild.security.raid.delete(data.user.id);
		this.handleFarewellMessage(guild, data.user);

		if (guild.settings.get(GuildSettings.Events.MemberRemove)) {
			await this.handleMemberLog(guild, data);
		}
	}

	private async handleMemberLog(guild: Guild, data: GatewayGuildMemberRemoveDispatch['d']) {
		const member = guild.members.cache.get(data.user.id);
		const isModerationAction = await this.isModerationAction(guild, data);

		const footer = isModerationAction.kicked
			? guild.language.get(LanguageKeys.Events.GuildMemberKicked)
			: isModerationAction.banned
			? guild.language.get(LanguageKeys.Events.GuildMemberBanned)
			: isModerationAction.softbanned
			? guild.language.get(LanguageKeys.Events.GuildMemberSoftBanned)
			: guild.language.get(LanguageKeys.Events.GuildMemberRemove);

		const time = this.processJoinedTimestamp(member);
		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, guild, () =>
			new MessageEmbed()
				.setColor(Colors.Red)
				.setAuthor(`${data.user.username}#${data.user.discriminator} (${data.user.id})`, getDisplayAvatar(data.user.id, data.user))
				.setDescription(
					guild.language.get(
						time === -1 ? LanguageKeys.Events.GuildMemberRemoveDescription : LanguageKeys.Events.GuildMemberRemoveDescriptionWithJoinedAt,
						{
							mention: `<@${data.user.id}>`,
							time
						}
					)
				)
				.setFooter(footer)
				.setTimestamp()
		);
	}

	private async isModerationAction(guild: SkyraGuild, data: GatewayGuildMemberRemoveDispatch['d']): Promise<IsModerationAction> {
		await guild.moderation.waitLock();

		const latestLogForUser = guild.moderation.getLatestLogForUser(data.user.id);

		if (latestLogForUser === null) {
			return {
				kicked: false,
				banned: false,
				softbanned: false
			};
		}

		return {
			kicked: latestLogForUser.isType(Moderation.TypeCodes.Kick),
			banned: latestLogForUser.isType(Moderation.TypeCodes.Ban),
			softbanned: latestLogForUser.isType(Moderation.TypeCodes.Softban)
		};
	}

	private processJoinedTimestamp(member: GuildMember | undefined) {
		if (typeof member === 'undefined') return -1;
		if (member.joinedTimestamp === null) return -1;
		return Date.now() - member.joinedTimestamp;
	}

	private handleFarewellMessage(guild: Guild, user: APIUser) {
		const channelsFarewell = guild.settings.get(GuildSettings.Channels.Farewell);
		const messagesFarewell = guild.settings.get(GuildSettings.Messages.Farewell);
		if (channelsFarewell && messagesFarewell) {
			const channel = guild.channels.cache.get(channelsFarewell) as TextChannel;
			if (channel && channel.postable) {
				channel.send(this.transformMessage(guild, user)).catch((error) => this.client.emit(Events.ApiError, error));
			} else {
				guild.settings.reset(GuildSettings.Channels.Farewell).catch((error) => this.client.emit(Events.Wtf, error));
			}
		}
	}

	private transformMessage(guild: Guild, user: APIUser) {
		return guild.settings.get(GuildSettings.Messages.Farewell).replace(this.kTransformMessageRegExp, (match) => {
			switch (match) {
				case Matches.Member:
					return `<@${user.id}>`;
				case Matches.MemberName:
					return user.username;
				case Matches.MemberTag:
					return `${user.username}#${user.discriminator}`;
				case Matches.Guild:
					return guild.name;
				default:
					return match;
			}
		});
	}
}

interface IsModerationAction {
	readonly kicked: boolean;
	readonly banned: boolean;
	readonly softbanned: boolean;
}
