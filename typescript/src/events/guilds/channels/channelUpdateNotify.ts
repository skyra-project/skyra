import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { toPermissionsArray } from '#utils/bits';
import { differenceBitField, differenceMap } from '#utils/common/comparators';
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

// TODO: DMChannel is not emitted in Discord v8, whenever we update to discord.js v13, this should be removed.
type GuildBasedChannel = TextChannel | VoiceChannel | CategoryChannel | NewsChannel | StoreChannel;
type Channel = DMChannel | GuildBasedChannel;

@ApplyOptions<EventOptions>({ event: Events.ChannelUpdate })
export class UserEvent extends Event<Events.ChannelUpdate> {
	public async run(previous: Channel, next: Channel) {
		if (isDMChannel(next)) return;

		const [channelID, t] = await readSettings(next.guild, (settings) => [
			settings[GuildSettings.Channels.Logs.ChannelUpdate],
			settings.getLanguage()
		]);
		if (isNullish(channelID)) return;

		const channel = next.guild.channels.cache.get(channelID) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(next.guild, [[GuildSettings.Channels.Logs.ChannelUpdate, null]]);
			return;
		}

		const changes: string[] = [...this.differenceChannel(t, previous as GuildBasedChannel, next)];
		if (changes.length === 0) return;

		await channel.send(
			new MessageEmbed()
				.setColor(Colors.Yellow)
				.setAuthor(`${next.name} (${next.id})`, channel.guild.iconURL({ size: 64, format: 'png', dynamic: true }) ?? undefined)
				.setDescription(changes.join('\n'))
				.setFooter(t(LanguageKeys.Events.Guilds.Logs.ChannelUpdate))
				.setTimestamp()
		);
	}

	private *differenceChannel(t: TFunction, previous: GuildBasedChannel, next: GuildBasedChannel) {
		yield* this.differenceGuildChannel(t, previous, next);
		if (previous.type !== next.type) return;

		switch (next.type) {
			case 'text':
				yield* this.differenceTextChannel(t, previous as TextChannel, next);
				break;
			case 'voice':
				yield* this.differenceVoiceChannel(t, previous as VoiceChannel, next);
				break;
			case 'news':
				yield* this.differenceNewsChannel(t, previous as NewsChannel, next);
				break;
			case 'store':
				yield* this.differenceStoreChannel(t, previous as StoreChannel, next);
				break;
			default:
			// No Op
		}

		yield* this.differencePermissionOverwrites(t, previous, next);
	}

	private *differenceGuildChannel(t: TFunction, previous: GuildChannel, next: GuildChannel) {
		if (previous.name !== next.name) {
			yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateName, { previous: previous.name, next: next.name });
		}

		if (previous.parentID !== next.parentID) {
			if (previous.parentID === null) {
				yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateParentAdded, { value: `<#${next.parentID}>` });
			} else if (next.parentID === null) {
				yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateParentRemoved, { value: `<#${previous.parentID}>` });
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
	}

	private *differencePermissionOverwrites(t: TFunction, previous: GuildChannel, next: GuildChannel) {
		const previousPermissions = previous.permissionOverwrites;
		const nextPermissions = next.permissionOverwrites;

		const difference = differenceMap(previousPermissions, nextPermissions);
		for (const added of difference.added.values()) {
			const allow = added.allow.bitfield;
			const deny = added.deny.bitfield;
			if (allow === 0 && deny === 0) continue;

			const mention = this.displayMention(added);
			yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateAddedPermissionsTitle, { value: mention });
			if (allow !== 0) {
				const values = toPermissionsArray(allow).map((value) => t(`permissions:${value}`));
				yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelCreatePermissionsAllow, { values, count: values.length });
			}

			if (deny !== 0) {
				const values = toPermissionsArray(deny).map((value) => t(`permissions:${value}`));
				yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelCreatePermissionsDeny, { values, count: values.length });
			}
		}

		for (const removed of difference.removed.values()) {
			const allow = removed.allow.bitfield;
			const deny = removed.deny.bitfield;
			if (allow === 0 && deny === 0) continue;

			const mention = this.displayMention(removed);
			yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateDeletedPermissionsTitle, { value: mention });
		}

		for (const [previousPermission, nextPermission] of difference.updated.values()) {
			const previousAllow = previousPermission.allow.bitfield;
			const nextAllow = nextPermission.allow.bitfield;
			const sameAllow = previousAllow === nextAllow;

			const previousDeny = previousPermission.deny.bitfield;
			const nextDeny = nextPermission.deny.bitfield;
			const sameDeny = previousDeny === nextDeny;

			if (sameAllow && sameDeny) continue;

			const mention = this.displayMention(nextPermission);
			yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdatePermissionsTitle, { value: mention });
			if (!sameAllow) {
				const modified = differenceBitField(previousAllow, nextAllow);
				if (modified.added !== 0) {
					const values = toPermissionsArray(modified.added).map((value) => t(`permissions:${value}`));
					yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateAddedPermissionsAllow, { values, count: values.length });
				}

				if (modified.removed !== 0) {
					const values = toPermissionsArray(modified.removed).map((value) => t(`permissions:${value}`));
					yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateRemovedPermissionsAllow, { values, count: values.length });
				}
			}

			if (!sameDeny) {
				const modified = differenceBitField(previousDeny, nextDeny);
				if (modified.added !== 0) {
					const values = toPermissionsArray(modified.added).map((value) => t(`permissions:${value}`));
					yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateAddedPermissionsDeny, { values, count: values.length });
				}

				if (modified.removed !== 0) {
					const values = toPermissionsArray(modified.removed).map((value) => t(`permissions:${value}`));
					yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateRemovedPermissionsDeny, { values, count: values.length });
				}
			}
		}
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
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateTopicAdded, { value: next! });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateTopicRemoved, { value: previous });
		return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateTopic, { previous, next });
	}

	private displayRateLimitPerUser(t: TFunction, previous: number, next: number) {
		if (previous === 0) return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateRateLimitAdded, { value: next * Time.Second });
		if (next === 0) return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateRateLimitRemoved, { value: previous * Time.Second });
		return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateRateLimit, { previous: previous * Time.Second, next: next * Time.Second });
	}

	private displayBitrate(t: TFunction, previous: number, next: number) {
		return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateBitrate, { previous: previous / 1000, next: next / 1000 });
	}

	private displayUserLimit(t: TFunction, previous: number, next: number) {
		if (previous === 0) return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateUserLimitAdded, { value: next });
		if (next === 0) return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateUserLimitRemoved, { value: previous });
		return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateUserLimit, { previous, next });
	}

	private displayMention(permissions: PermissionOverwrites) {
		if (permissions.type === 'member') return `<@${permissions.id}>`;
		if (permissions.id === permissions.channel.guild.id) return '@everyone';
		return `<@&${permissions.id}>`;
	}
}
