import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { toPermissionsArray } from '#utils/bits';
import { LongWidthSpace } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { isDMChannel } from '@sapphire/discord.js-utilities';
import { Event, EventOptions, Events } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { isNullish } from '@sapphire/utilities';
import {
	CategoryChannel,
	DMChannel,
	GuildChannel,
	MessageEmbed,
	NewsChannel,
	PermissionOverwrites,
	StoreChannel,
	TextChannel,
	VoiceChannel
} from 'discord.js';
import type { TFunction } from 'i18next';

// NOTE: DMChannel is not emitted in Discord v8, whenever we update to discord.js v13, this should be removed.
type GuildBasedChannel = TextChannel | VoiceChannel | CategoryChannel | NewsChannel | StoreChannel;
type Channel = DMChannel | GuildBasedChannel;

@ApplyOptions<EventOptions>({ event: Events.ChannelCreate })
export class UserEvent extends Event<Events.ChannelCreate> {
	public async run(next: Channel) {
		if (isDMChannel(next)) return;

		const [channelID, t] = await next.guild.readSettings((settings) => [
			settings[GuildSettings.Channels.Logs.ChannelCreate],
			settings.getLanguage()
		]);
		if (isNullish(channelID)) return;

		const channel = next.guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (channel === undefined) {
			await next.guild.writeSettings([[GuildSettings.Channels.Logs.ChannelCreate, null]]);
			return;
		}

		const changes: string[] = [...this.getChannelInformation(t, next)];
		await channel.send(
			new MessageEmbed()
				.setColor(Colors.Green)
				.setAuthor(`${next.name} (${next.id})`, channel.guild.iconURL({ size: 64, format: 'png', dynamic: true }) ?? undefined)
				.setDescription(changes.join('\n'))
				.setFooter(t(LanguageKeys.Events.Guilds.Logs.ChannelCreate))
				.setTimestamp()
		);
	}

	private *getChannelInformation(t: TFunction, channel: GuildBasedChannel) {
		yield* this.getGuildChannelInformation(t, channel);

		switch (channel.type) {
			case 'text':
				yield* this.getTextChannelInformation(t, channel);
				break;
			case 'voice':
				yield* this.getVoiceChannelInformation(t, channel);
				break;
			case 'news':
				yield* this.getNewsChannelInformation(t, channel);
				break;
			case 'store':
				yield* this.getStoreChannelInformation(t, channel);
				break;
			default:
			// No Op
		}

		yield* this.getChannelPermissionOverwrites(t, channel);
	}

	private *getGuildChannelInformation(t: TFunction, channel: GuildChannel) {
		if (channel.parentID) yield t(LanguageKeys.Events.Guilds.Logs.ChannelCreateParent, { value: `<#${channel.parentID}>` });
		yield t(LanguageKeys.Events.Guilds.Logs.ChannelCreatePosition, { value: channel.position });
	}

	private *getChannelPermissionOverwrites(t: TFunction, channel: GuildChannel) {
		for (const overwrite of channel.permissionOverwrites.values()) {
			const allow = overwrite.allow.bitfield;
			const deny = overwrite.deny.bitfield;
			if (allow === 0 && deny === 0) continue;

			const mention = this.displayMention(overwrite);
			yield t(LanguageKeys.Events.Guilds.Logs.ChannelCreatePermissionsTitle, { value: mention });
			if (allow !== 0) {
				const values = toPermissionsArray(allow).map((value) => t(`permissions:${value}`));
				yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelCreatePermissionsAllow, { values, count: values.length });
			}

			if (deny !== 0) {
				const values = toPermissionsArray(deny).map((value) => t(`permissions:${value}`));
				yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelCreatePermissionsDeny, { values, count: values.length });
			}
		}
	}

	private *getTextChannelInformation(t: TFunction, channel: TextChannel) {
		if (channel.nsfw) yield this.displayNsfw(t);
		if (channel.topic) yield this.displayTopic(t, channel.topic);
		if (channel.rateLimitPerUser) yield this.displayRateLimitPerUser(t, channel.rateLimitPerUser);
	}

	private *getVoiceChannelInformation(t: TFunction, channel: VoiceChannel) {
		yield this.displayBitrate(t, channel.bitrate);
		if (channel.userLimit !== 0) yield this.displayUserLimit(t, channel.userLimit);
	}

	private *getNewsChannelInformation(t: TFunction, channel: NewsChannel) {
		if (channel.nsfw) yield this.displayNsfw(t);
		if (channel.topic) yield this.displayTopic(t, channel.topic);
	}

	private *getStoreChannelInformation(t: TFunction, channel: StoreChannel) {
		if (channel.nsfw) yield this.displayNsfw(t);
	}

	private displayNsfw(t: TFunction) {
		return t(LanguageKeys.Events.Guilds.Logs.ChannelCreateNsfw);
	}

	private displayTopic(t: TFunction, value: string) {
		return t(LanguageKeys.Events.Guilds.Logs.ChannelCreateTopic, { value });
	}

	private displayRateLimitPerUser(t: TFunction, value: number) {
		return t(LanguageKeys.Events.Guilds.Logs.ChannelCreateRateLimit, { value: value * Time.Second });
	}

	private displayBitrate(t: TFunction, value: number) {
		return t(LanguageKeys.Events.Guilds.Logs.ChannelCreateBitrate, { value: value / 1000 });
	}

	private displayUserLimit(t: TFunction, value: number) {
		return t(LanguageKeys.Events.Guilds.Logs.ChannelCreateUserLimit, { value });
	}

	private displayMention(permissions: PermissionOverwrites) {
		if (permissions.type === 'member') return `<@${permissions.id}>`;
		if (permissions.id === permissions.channel.guild.id) return '@everyone';
		return `<@&${permissions.id}>`;
	}
}
