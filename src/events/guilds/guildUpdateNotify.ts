import { GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { toChannelsArray } from '#utils/bits';
import { differenceArray, differenceBitField } from '#utils/common/comparators';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions, Events } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { isNullish } from '@sapphire/utilities';
import {
	DefaultMessageNotifications,
	ExplicitContentFilterLevel,
	Guild,
	GuildFeatures,
	MessageEmbed,
	SystemChannelFlags,
	TextChannel,
	VerificationLevel
} from 'discord.js';
import type { TFunction } from 'i18next';

type MessageNotifications = DefaultMessageNotifications | number;
type ChannelFlags = Readonly<SystemChannelFlags>;
type Features = readonly GuildFeatures[];

@ApplyOptions<EventOptions>({ event: Events.GuildUpdate })
export class UserEvent extends Event<Events.GuildUpdate> {
	public async run(previous: Guild, next: Guild) {
		const [channelID, t] = await readSettings(next, (settings) => [
			settings[GuildSettings.Channels.Logs.ServerUpdate], //
			settings.getLanguage()
		]);
		if (isNullish(channelID)) return;

		const channel = next.channels.cache.get(channelID) as TextChannel | undefined;
		if (channel === undefined) {
			await writeSettings(next, [[GuildSettings.Channels.Logs.ServerUpdate, null]]);
			return;
		}

		const changes: string[] = [...this.differenceGuild(t, previous, next)];
		if (changes.length === 0) return;

		await channel.send(
			new MessageEmbed()
				.setColor(Colors.Yellow)
				.setAuthor(`${next.name} (${next.id})`, channel.guild.iconURL({ size: 64, format: 'png', dynamic: true }) ?? undefined)
				.setDescription(changes.join('\n'))
				.setFooter(t(LanguageKeys.Events.Guilds.Logs.ServerUpdate))
				.setTimestamp()
		);
	}

	private *differenceGuild(t: TFunction, previous: Guild, next: Guild) {
		if (previous.afkChannelID !== next.afkChannelID) {
			yield this.displayAfkChannel(t, previous.afkChannelID, next.afkChannelID);
		}

		if (previous.afkTimeout !== next.afkTimeout) {
			yield this.displayAfkTimeout(t, previous.afkTimeout, next.afkTimeout);
		}

		if (previous.banner !== next.banner) {
			yield this.displayBanner(t, previous.bannerURL(), next.bannerURL());
		}

		if (previous.defaultMessageNotifications !== next.defaultMessageNotifications) {
			yield this.displayDefaultMessageNotifications(t, previous.defaultMessageNotifications, next.defaultMessageNotifications);
		}

		if (previous.description !== next.description) {
			yield this.displayDescription(t, previous.description, next.description);
		}

		if (previous.discoverySplash !== next.discoverySplash) {
			yield this.displayDiscoverySplash(t, previous.discoverySplashURL(), next.discoverySplashURL());
		}

		if (previous.explicitContentFilter !== next.explicitContentFilter) {
			yield this.displayExplicitContentFilter(t, previous.explicitContentFilter, next.explicitContentFilter);
		}

		if (previous.features !== next.features) {
			yield* this.displayFeatures(t, previous.features, next.features);
		}

		if (previous.icon !== next.icon) {
			yield this.displayIcon(t, previous.iconURL(), next.iconURL());
		}

		if (previous.maximumMembers !== next.maximumMembers) {
			yield this.displayMaximumMembers(t, previous.maximumMembers, next.maximumMembers);
		}

		if (previous.mfaLevel !== next.mfaLevel) {
			yield this.displayMfaLevel(t, next.mfaLevel);
		}

		if (previous.name !== next.name) {
			yield this.displayName(t, previous.name, next.name);
		}

		if (previous.ownerID !== next.ownerID) {
			yield this.displayOwner(t, previous.ownerID, next.ownerID);
		}

		if (previous.preferredLocale !== next.preferredLocale) {
			yield this.displayPreferredLocale(t, previous.preferredLocale, next.preferredLocale);
		}

		if (previous.premiumSubscriptionCount !== next.premiumSubscriptionCount) {
			yield this.displayPremiumSubscriptionCount(t, previous.premiumSubscriptionCount, next.premiumSubscriptionCount);
		}

		if (previous.premiumTier !== next.premiumTier) {
			yield this.displayPremiumTier(t, previous.premiumTier, next.premiumTier);
		}

		if (previous.publicUpdatesChannelID !== next.publicUpdatesChannelID) {
			yield this.displayPublicUpdatesChannel(t, previous.publicUpdatesChannelID, next.publicUpdatesChannelID);
		}

		if (previous.region !== next.region) {
			yield this.displayRegion(t, previous.region, next.region);
		}

		if (previous.rulesChannelID !== next.rulesChannelID) {
			yield this.displayRulesChannel(t, previous.rulesChannelID, next.rulesChannelID);
		}

		if (previous.splash !== next.splash) {
			yield this.displaySplash(t, previous.splashURL(), next.splashURL());
		}

		if (previous.systemChannelFlags !== next.systemChannelFlags) {
			yield* this.displaySystemChannelFlags(t, previous.systemChannelFlags, next.systemChannelFlags);
		}

		if (previous.systemChannelID !== next.systemChannelID) {
			yield this.displaySystemChannel(t, previous.systemChannelID, next.systemChannelID);
		}

		if (previous.vanityURLCode !== next.vanityURLCode) {
			yield this.displayVanityURLCode(t, previous.vanityURLCode, next.vanityURLCode);
		}

		if (previous.verificationLevel !== next.verificationLevel) {
			yield this.displayVerificationLevel(t, previous.verificationLevel, next.verificationLevel);
		}

		if (previous.widgetChannelID !== next.widgetChannelID) {
			yield this.displayWidgetChannel(t, previous.widgetChannelID, next.widgetChannelID);
		}

		if (previous.widgetEnabled !== next.widgetEnabled) {
			yield this.displayWidgetEnabled(t, previous.widgetEnabled, next.widgetEnabled);
		}
	}

	private displayAfkChannel(t: TFunction, previous: string | null, next: string | null): string {
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateAfkChannelAdded, { value: `<#${next!}>` });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateAfkChannelRemoved, { value: `<#${previous}>` });
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateAfkChannel, { previous: `<#${previous}>`, next: `<#${next}>` });
	}

	private displayAfkTimeout(t: TFunction, previous: number, next: number): string {
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateAfkTimeout, { previous: previous * Time.Second, next: next * Time.Second });
	}

	private displayBanner(t: TFunction, previous: string | null, next: string | null): string {
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateBannerAdded, { value: next! });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateBannerRemoved, { value: previous });
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateBanner, { previous, next });
	}

	private displayDefaultMessageNotifications(t: TFunction, previous: MessageNotifications, next: MessageNotifications): string {
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateDefaultMessageNotifications, { previous, next });
	}

	private displayDescription(t: TFunction, previous: string | null, next: string | null): string {
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateDescriptionAdded, { value: next! });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateDescriptionRemoved, { value: previous });
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateDescription, { previous, next });
	}

	private displayDiscoverySplash(t: TFunction, previous: string | null, next: string | null): string {
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateDiscoverySplashAdded, { value: next! });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateDiscoverySplashRemoved, { value: previous });
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateDiscoverySplash, { previous, next });
	}

	private displayExplicitContentFilter(t: TFunction, previous: ExplicitContentFilterLevel, next: ExplicitContentFilterLevel): string {
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateExplicitContentFilter, { previous, next });
	}

	private *displayFeatures(t: TFunction, previous: Features, next: Features): IterableIterator<string> {
		const difference = differenceArray(previous, next);
		if (difference.added.length) {
			const values = difference.added;
			yield t(LanguageKeys.Events.Guilds.Logs.ServerUpdateFeaturesAdded, { values, count: values.length });
		}

		if (difference.removed.length) {
			const values = difference.removed;
			yield t(LanguageKeys.Events.Guilds.Logs.ServerUpdateFeaturesRemoved, { values, count: values.length });
		}
	}

	private displayIcon(t: TFunction, previous: string | null, next: string | null): string {
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateIconAdded, { value: next! });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateIconRemoved, { value: previous });
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateIcon, { previous, next });
	}

	private displayMaximumMembers(t: TFunction, previous: number | null, next: number | null): string {
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateMaximumMembersAdded, { value: next! });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateMaximumMembersRemoved, { value: previous });
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateMaximumMembers, { previous, next });
	}

	private displayMfaLevel(t: TFunction, next: number): string {
		return t(next === 1 ? LanguageKeys.Events.Guilds.Logs.ServerUpdateMfaAdded : LanguageKeys.Events.Guilds.Logs.ServerUpdateMfaRemoved);
	}

	private displayName(t: TFunction, previous: string, next: string): string {
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateName, { previous, next });
	}

	private displayOwner(t: TFunction, previous: string, next: string): string {
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateOwner, { previous: `<@${previous}>`, next: `<@${next}>` });
	}

	private displayPreferredLocale(t: TFunction, previous: string, next: string): string {
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdatePreferredLocale, { previous, next });
	}

	private displayPremiumSubscriptionCount(t: TFunction, previous: number | null, next: number | null): string {
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdatePremiumSubscriptionCountAdded, { value: next! });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdatePremiumSubscriptionCountRemoved, { value: previous });
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdatePremiumSubscriptionCount, { previous, next });
	}

	private displayPremiumTier(t: TFunction, previous: number, next: number): string {
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdatePremiumTier, { previous, next });
	}

	private displayPublicUpdatesChannel(t: TFunction, previous: string | null, next: string | null): string {
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdatePublicUpdatesChannelAdded, { value: `<#${next!}>` });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdatePublicUpdatesChannelRemoved, { value: `<#${previous}>` });
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdatePublicUpdatesChannel, { previous: `<#${previous}>`, next: `<#${next}>` });
	}

	private displayRegion(t: TFunction, previous: string, next: string): string {
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateRegion, { previous, next });
	}

	private displayRulesChannel(t: TFunction, previous: string | null, next: string | null): string {
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateRulesChannelAdded, { value: `<#${next!}>` });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateRulesChannelRemoved, { value: `<#${previous}>` });
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateRulesChannel, { previous: `<#${previous}>`, next: `<#${next}>` });
	}

	private displaySplash(t: TFunction, previous: string | null, next: string | null): string {
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateSplashAdded, { value: next! });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateSplashRemoved, { value: previous });
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateSplash, { previous, next });
	}

	private *displaySystemChannelFlags(t: TFunction, previous: ChannelFlags, next: ChannelFlags): IterableIterator<string> {
		// NOTE: The order is swapped because fields being set mean they're disabled, opposite to other fields:
		const modified = differenceBitField(next.bitfield, previous.bitfield);
		if (modified.added !== 0) {
			const values = toChannelsArray(modified.added).map((value) => t(`guilds:${value}`));
			yield t(LanguageKeys.Events.Guilds.Logs.ServerUpdateSystemChannelFlagsAdded, { values, count: values.length });
		}

		if (modified.removed !== 0) {
			const values = toChannelsArray(modified.removed).map((value) => t(`guilds:${value}`));
			yield t(LanguageKeys.Events.Guilds.Logs.ServerUpdateSystemChannelFlagsRemoved, { values, count: values.length });
		}
	}

	private displaySystemChannel(t: TFunction, previous: string | null, next: string | null): string {
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateSystemChannelAdded, { value: `<#${next!}>` });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateSystemChannelRemoved, { value: `<#${previous}>` });
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateSystemChannel, { previous: `<#${previous}>`, next: `<#${next}>` });
	}

	private displayVanityURLCode(t: TFunction, previous: string | null, next: string | null): string {
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateVanityUrlAdded, { value: next! });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateVanityUrlRemoved, { value: previous });
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateVanityUrl, { previous, next });
	}

	private displayVerificationLevel(t: TFunction, previous: VerificationLevel, next: VerificationLevel): string {
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateVerificationLevel, { previous, next });
	}

	private displayWidgetChannel(t: TFunction, previous: string | null, next: string | null): string {
		if (previous === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateWidgetChannelAdded, { value: `<#${next!}>` });
		if (next === null) return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateWidgetChannelRemoved, { value: `<#${previous}>` });
		return t(LanguageKeys.Events.Guilds.Logs.ServerUpdateWidgetChannel, { previous: `<#${previous}>`, next: `<#${next}>` });
	}

	private displayWidgetEnabled(t: TFunction, previous: boolean | null, next: boolean | null): string {
		return t(
			next ?? !previous ? LanguageKeys.Events.Guilds.Logs.ServerUpdateWidgetEnabled : LanguageKeys.Events.Guilds.Logs.ServerUpdateWidgetDisabled
		);
	}
}
