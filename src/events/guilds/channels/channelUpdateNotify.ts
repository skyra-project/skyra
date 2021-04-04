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

@ApplyOptions<EventOptions>({ event: Events.ChannelUpdate })
export class UserEvent extends Event<Events.ChannelUpdate> {
	public async run(previous: Channel, next: Channel) {
		const [channelID, t] = await next.guild.readSettings((settings) => [
			settings[GuildSettings.Channels.Logs.ChannelUpdate],
			settings.getLanguage()
		]);
		if (isNullish(channelID)) return;

		const channel = next.guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (channel === undefined) {
			await next.guild.writeSettings([[GuildSettings.Channels.Logs.ChannelUpdate, null]]);
			return;
		}

		const changes: string[] = [...this.differenceChannel(t, previous, next)];

		if (changes.length === 0) return;

		await channel.send(
			new MessageEmbed()
				.setColor(Colors.Yellow)
				.setTitle(t(LanguageKeys.Events.Guilds.Logs.ChannelUpdate))
				.setDescription(changes.join('\n'))
				.setTimestamp()
		);
	}

	private *differenceChannel(t: TFunction, previous: Channel, next: Channel) {
		yield* this.differenceGuildChannel(t, previous, next);
		if (previous.type !== next.type) return;

		switch (next.type) {
			case 'text':
				return yield* this.differenceTextChannel(t, previous as TextChannel, next);
			case 'voice':
				return yield* this.differenceVoiceChannel(t, previous as VoiceChannel, next);
			case 'news':
				return yield* this.differenceNewsChannel(t, previous as NewsChannel, next);
			case 'store':
				return yield* this.differenceStoreChannel(t, previous as StoreChannel, next);
			default:
			// No Op
		}
	}

	private *differenceGuildChannel(t: TFunction, previous: GuildChannel, next: GuildChannel) {
		if (previous.name !== next.name) {
			yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateName, { previous: previous.name, next: next.name });
		}

		if (previous.parentID !== next.parentID) {
			if (previous.parentID === null) {
				yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateParentAdded, { channel: `<#${next.parentID}>` });
			} else if (next.parentID === null) {
				yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateParentRemoved, { channel: `<#${previous.parentID}>` });
			} else {
				yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateParent, { previous: `<#${previous.parentID}>`, next: `<#${next.parentID}>` });
			}
		}

		if (previous.position !== next.position) {
			yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdatePosition, { previous: previous.position, next: next.position });
		}

		if (previous.type !== next.type) {
			yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateType, { previous: previous.type, next: next.type });
		}

		// TODO(kyranet): Add this:
		// previous.permissionOverwrites
	}

	private *differenceTextChannel(t: TFunction, previous: TextChannel, next: TextChannel) {
		if (previous.nsfw !== next.nsfw) yield this.displayNsfw(t, previous.nsfw, next.nsfw);
		if (previous.topic !== next.topic) yield this.displayTopic(t, previous.topic, next.topic);
		if (previous.rateLimitPerUser !== next.rateLimitPerUser) {
			yield this.displayRateLimitPerUser(t, previous.rateLimitPerUser, next.rateLimitPerUser);
		}
	}

	private *differenceVoiceChannel(t: TFunction, previous: VoiceChannel, next: VoiceChannel) {
		if (previous.bitrate !== next.bitrate) yield this.displayBitrate(t, previous.bitrate, next.bitrate);
		if (previous.userLimit !== next.userLimit) yield this.displayUserLimit(t, previous.userLimit, next.userLimit);
	}

	private *differenceNewsChannel(t: TFunction, previous: NewsChannel, next: NewsChannel) {
		if (previous.nsfw !== next.nsfw) yield this.displayNsfw(t, previous.nsfw, next.nsfw);
		if (previous.topic !== next.topic) yield this.displayTopic(t, previous.topic, next.topic);
	}

	private *differenceStoreChannel(t: TFunction, previous: StoreChannel, next: StoreChannel) {
		if (previous.nsfw !== next.nsfw) yield this.displayNsfw(t, previous.nsfw, next.nsfw);
	}

	private displayNsfw(t: TFunction, previous: boolean, next: boolean) {
		return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateNsfw, {
			previous: t(previous ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No),
			next: t(next ? LanguageKeys.Globals.Yes : LanguageKeys.Globals.No)
		});
	}

	private displayTopic(t: TFunction, previous: string | null, next: string | null) {
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateTopicAdded, { topic: next! });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateTopicRemoved, { topic: previous });
		return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateTopic, { previous, next });
	}

	private displayRateLimitPerUser(t: TFunction, previous: number, next: number) {
		if (previous === 0) return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateRateLimitAdded, { rateLimit: next * Time.Second });
		if (next === 0) return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateRateLimitRemoved, { rateLimit: previous * Time.Second });
		return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateRateLimit, { previous: previous * Time.Second, next: next * Time.Second });
	}

	private displayBitrate(t: TFunction, previous: number, next: number) {
		return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateBitrate, { previous, next });
	}

	private displayUserLimit(t: TFunction, previous: number, next: number) {
		if (previous === 0) return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateUserLimitAdded, { userLimit: next });
		if (next === 0) return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateUserLimitRemoved, { userLimit: previous });
		return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateUserLimit, { previous, next });
	}
}
