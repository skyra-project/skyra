import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { toPermissionsArray } from '#utils/bits';
import { seconds } from '#utils/common';
import { differenceBitField, differenceMap } from '#utils/common/comparators';
import { LongWidthSpace } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import type { GuildBasedChannelTypes, NonThreadGuildBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { DMChannel, GuildChannel, MessageEmbed, NewsChannel, PermissionOverwrites, StoreChannel, TextChannel, VoiceChannel } from 'discord.js';
import type { TFunction } from 'i18next';

type ChannelType = DMChannel | GuildChannel;

@ApplyOptions<ListenerOptions>({ event: Events.ChannelUpdate })
export class UserListener extends Listener<typeof Events.ChannelUpdate> {
	public async run(previous: ChannelType, next: ChannelType) {
		if (next.type === 'DM') return;

		const [channelId, t] = await readSettings(next.guild, (settings) => [
			settings[GuildSettings.Channels.Logs.ChannelUpdate],
			settings.getLanguage()
		]);
		if (isNullish(channelId)) return;

		const channel = next.guild.channels.cache.get(channelId) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(next.guild, [[GuildSettings.Channels.Logs.ChannelUpdate, null]]);
			return;
		}

		const changes: string[] = [...this.differenceChannel(t, previous as GuildBasedChannelTypes, next as GuildBasedChannelTypes)];
		if (changes.length === 0) return;

		const embed = new MessageEmbed()
			.setColor(Colors.Yellow)
			.setAuthor(`${next.name} (${next.id})`, channel.guild.iconURL({ size: 64, format: 'png', dynamic: true }) ?? undefined)
			.setDescription(changes.join('\n'))
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.ChannelUpdate))
			.setTimestamp();
		await channel.send({ embeds: [embed] });
	}

	private *differenceChannel(t: TFunction, previous: GuildBasedChannelTypes, next: GuildBasedChannelTypes) {
		const isThread = next.isThread();

		yield* this.differenceGuildChannel(t, previous, next);
		if (!isThread) {
			yield* this.differencePositions(t, previous as NonThreadGuildBasedChannelTypes, next as NonThreadGuildBasedChannelTypes);
		}

		if (previous.type !== next.type) return;

		switch (next.type) {
			case 'GUILD_TEXT':
				yield* this.differenceTextChannel(t, previous as TextChannel, next as TextChannel);
				break;
			case 'GUILD_VOICE':
				yield* this.differenceVoiceChannel(t, previous as VoiceChannel, next as VoiceChannel);
				break;
			case 'GUILD_NEWS':
				yield* this.differenceNewsChannel(t, previous as NewsChannel, next as NewsChannel);
				break;
			case 'GUILD_STORE':
				yield* this.differenceStoreChannel(t, previous as StoreChannel, next as StoreChannel);
				break;
			default:
			// No Op
		}

		if (isThread) {
			yield* this.differencePermissionOverwrites(t, previous as NonThreadGuildBasedChannelTypes, next as NonThreadGuildBasedChannelTypes);
		}
	}

	private *differenceGuildChannel(t: TFunction, previous: GuildBasedChannelTypes, next: GuildBasedChannelTypes) {
		if (previous.name !== next.name) {
			yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateName, { previous: previous.name, next: next.name });
		}

		if (previous.parentId !== next.parentId) {
			if (previous.parentId === null) {
				yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateParentAdded, { value: `<#${next.parentId}>` });
			} else if (next.parentId === null) {
				yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateParentRemoved, { value: `<#${previous.parentId}>` });
			} else {
				yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateParent, { previous: `<#${previous.parentId}>`, next: `<#${next.parentId}>` });
			}
		}

		if (previous.type !== next.type) {
			yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateType, { previous: previous.type, next: next.type });
		}
	}

	private *differencePositions(t: TFunction, previous: NonThreadGuildBasedChannelTypes, next: NonThreadGuildBasedChannelTypes) {
		if (previous.position !== next.position) {
			yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdatePosition, { previous: previous.position, next: next.position });
		}
	}

	private *differencePermissionOverwrites(t: TFunction, previous: NonThreadGuildBasedChannelTypes, next: NonThreadGuildBasedChannelTypes) {
		const previousPermissions = previous.permissionOverwrites.cache;
		const nextPermissions = next.permissionOverwrites.cache;

		const difference = differenceMap(previousPermissions, nextPermissions);
		for (const added of difference.added.values()) {
			const allow = added.allow.bitfield;
			const deny = added.deny.bitfield;
			if (allow === 0n && deny === 0n) continue;

			const mention = this.displayMention(added);
			yield t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateAddedPermissionsTitle, { value: mention });
			if (allow !== 0n) {
				const values = toPermissionsArray(allow).map((value) => t(`permissions:${value}`));
				yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelCreatePermissionsAllow, { values, count: values.length });
			}

			if (deny !== 0n) {
				const values = toPermissionsArray(deny).map((value) => t(`permissions:${value}`));
				yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelCreatePermissionsDeny, { values, count: values.length });
			}
		}

		for (const removed of difference.removed.values()) {
			const allow = removed.allow.bitfield;
			const deny = removed.deny.bitfield;
			if (allow === 0n && deny === 0n) continue;

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
				if (modified.added !== 0n) {
					const values = toPermissionsArray(modified.added).map((value) => t(`permissions:${value}`));
					yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateAddedPermissionsAllow, { values, count: values.length });
				}

				if (modified.removed !== 0n) {
					const values = toPermissionsArray(modified.removed).map((value) => t(`permissions:${value}`));
					yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateRemovedPermissionsAllow, { values, count: values.length });
				}
			}

			if (!sameDeny) {
				const modified = differenceBitField(previousDeny, nextDeny);
				if (modified.added !== 0n) {
					const values = toPermissionsArray(modified.added).map((value) => t(`permissions:${value}`));
					yield LongWidthSpace + t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateAddedPermissionsDeny, { values, count: values.length });
				}

				if (modified.removed !== 0n) {
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
		if (previous === 0) return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateRateLimitAdded, { value: seconds(next) });
		if (next === 0) return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateRateLimitRemoved, { value: seconds(previous) });
		return t(LanguageKeys.Events.Guilds.Logs.ChannelUpdateRateLimit, { previous: seconds(previous), next: seconds(next) });
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
