import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { getT } from '#lib/i18n';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { toPermissionsArray } from '#utils/bits';
import { seconds } from '#utils/common';
import { Colors, LongWidthSpace } from '#utils/constants';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { isNsfwChannel } from '@sapphire/discord.js-utilities';
import { Events, Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import {
	ChannelType,
	OverwriteType,
	type GuildChannel,
	type NewsChannel,
	type PermissionOverwrites,
	type TextChannel,
	type VoiceChannel
} from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.ChannelCreate })
export class UserListener extends Listener<typeof Events.ChannelCreate> {
	public async run(next: GuildChannel) {
		const settings = await readSettings(next.guild);
		const channelId = settings.channelsLogsChannelCreate;
		if (isNullish(channelId)) return;

		const channel = next.guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(next.guild, [[GuildSettings.Channels.Logs.ChannelCreate, null]]);
			return;
		}

		const t = getT(settings.language);
		const changes: string[] = [...this.getChannelInformation(t, next)];
		const embed = new EmbedBuilder()
			.setColor(Colors.Green)
			.setAuthor({ name: `${next.name} (${next.id})`, iconURL: channel.guild.iconURL({ size: 64, extension: 'png' }) ?? undefined })
			.setDescription(changes.join('\n'))
			.setFooter({ text: t(LanguageKeys.Events.Guilds.Logs.ChannelCreate) })
			.setTimestamp();
		await channel.send({ embeds: [embed] });
	}

	private *getChannelInformation(t: TFunction, channel: GuildChannel) {
		yield* this.getGuildChannelInformation(t, channel);

		switch (channel.type) {
			case ChannelType.GuildText:
				yield* this.getTextChannelInformation(t, channel as TextChannel);
				break;
			case ChannelType.GuildStageVoice:
			case ChannelType.GuildVoice:
				yield* this.getVoiceChannelInformation(t, channel as VoiceChannel);
				break;
			case ChannelType.GuildAnnouncement:
				yield* this.getNewsChannelInformation(t, channel as NewsChannel);
				break;
			default:
			// No Op
		}

		yield* this.getChannelPermissionOverwrites(t, channel);
	}

	private *getGuildChannelInformation(t: TFunction, channel: GuildChannel) {
		if (channel.parentId) yield t(LanguageKeys.Events.Guilds.Logs.ChannelCreateParent, { value: `<#${channel.parentId}>` });
		yield t(LanguageKeys.Events.Guilds.Logs.ChannelCreatePosition, { value: channel.position });
	}

	private *getChannelPermissionOverwrites(t: TFunction, channel: GuildChannel) {
		for (const overwrite of channel.permissionOverwrites.cache.values()) {
			const allow = overwrite.allow.bitfield;
			const deny = overwrite.deny.bitfield;
			if (allow === 0n && deny === 0n) continue;

			const mention = this.displayMention(overwrite);
			yield t(LanguageKeys.Events.Guilds.Logs.ChannelCreatePermissionsTitle, { value: mention });
			if (allow !== 0n) {
				const values = toPermissionsArray(allow).map((value) => t(`permissions:${value}`));
				yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelCreatePermissionsAllow, { values, count: values.length });
			}

			if (deny !== 0n) {
				const values = toPermissionsArray(deny).map((value) => t(`permissions:${value}`));
				yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelCreatePermissionsDeny, { values, count: values.length });
			}
		}
	}

	private *getTextChannelInformation(t: TFunction, channel: TextChannel) {
		if (isNsfwChannel(channel)) yield this.displayNsfw(t);
		if (channel.topic) yield this.displayTopic(t, channel.topic);
		if (channel.rateLimitPerUser) yield this.displayRateLimitPerUser(t, channel.rateLimitPerUser);
	}

	private *getVoiceChannelInformation(t: TFunction, channel: VoiceChannel) {
		yield this.displayBitrate(t, channel.bitrate);
		if (channel.userLimit !== 0) yield this.displayUserLimit(t, channel.userLimit);
	}

	private *getNewsChannelInformation(t: TFunction, channel: NewsChannel) {
		if (isNsfwChannel(channel)) yield this.displayNsfw(t);
		if (channel.topic) yield this.displayTopic(t, channel.topic);
	}

	private displayNsfw(t: TFunction) {
		return t(LanguageKeys.Events.Guilds.Logs.ChannelCreateNsfw);
	}

	private displayTopic(t: TFunction, value: string) {
		return t(LanguageKeys.Events.Guilds.Logs.ChannelCreateTopic, { value });
	}

	private displayRateLimitPerUser(t: TFunction, value: number) {
		return t(LanguageKeys.Events.Guilds.Logs.ChannelCreateRateLimit, { value: seconds(value) });
	}

	private displayBitrate(t: TFunction, value: number) {
		return t(LanguageKeys.Events.Guilds.Logs.ChannelCreateBitrate, { value: value / 1000 });
	}

	private displayUserLimit(t: TFunction, value: number) {
		return t(LanguageKeys.Events.Guilds.Logs.ChannelCreateUserLimit, { value });
	}

	private displayMention(permissions: PermissionOverwrites) {
		if (permissions.type === OverwriteType.Member) return `<@${permissions.id}>`;
		if (permissions.id === permissions.channel.guild.id) return '@everyone';
		return `<@&${permissions.id}>`;
	}
}
