import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions, Events } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { isNullish } from '@sapphire/utilities';
import { CategoryChannel, GuildChannel, MessageEmbed, NewsChannel, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';
import type { TFunction } from 'i18next';

type Channel = TextChannel | VoiceChannel | CategoryChannel | NewsChannel | StoreChannel;

@ApplyOptions<EventOptions>({ event: Events.ChannelCreate })
export class UserEvent extends Event<Events.ChannelCreate> {
	public async run(next: Channel) {
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

	private *getChannelInformation(t: TFunction, channel: Channel) {
		yield* this.getGuildChannelInformation(t, channel);

		switch (channel.type) {
			case 'text':
				return yield* this.getTextChannelInformation(t, channel);
			case 'voice':
				return yield* this.getVoiceChannelInformation(t, channel);
			case 'news':
				return yield* this.getNewsChannelInformation(t, channel);
			case 'store':
				return yield* this.getStoreChannelInformation(t, channel);
			default:
			// No Op
		}
	}

	private *getGuildChannelInformation(t: TFunction, channel: GuildChannel) {
		if (channel.parentID) yield t(LanguageKeys.Events.Guilds.Logs.ChannelCreateParent, { value: `<#${channel.parentID}>` });
		yield t(LanguageKeys.Events.Guilds.Logs.ChannelCreatePosition, { value: channel.position });

		// TODO(kyranet): Add this:
		// channel.permissionOverwrites
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
		return t(LanguageKeys.Events.Guilds.Logs.ChannelCreateBitrate, { value });
	}

	private displayUserLimit(t: TFunction, value: number) {
		return t(LanguageKeys.Events.Guilds.Logs.ChannelCreateUserLimit, { value });
	}
}
