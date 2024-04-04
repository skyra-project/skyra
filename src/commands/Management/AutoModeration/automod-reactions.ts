import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AutoModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

const Root = LanguageKeys.Commands.AutoModeration;
const SettingsRoot = GuildSettings.AutoModeration.Reactions;

@ApplyOptions<AutoModerationCommand.Options>({
	aliases: ['reaction-mode', 'r-mode'],
	description: Root.ReactionsDescription,
	localizedNameKey: Root.ReactionsName,
	adderPropertyName: 'reactions',
	keyEnabled: SettingsRoot.Enabled,
	keyOnInfraction: SettingsRoot.SoftAction,
	keyPunishment: SettingsRoot.HardAction,
	keyPunishmentDuration: SettingsRoot.HardActionDuration,
	keyPunishmentThreshold: SettingsRoot.ThresholdMaximum,
	keyPunishmentThresholdPeriod: SettingsRoot.ThresholdDuration
})
export class UserAutoModerationCommand extends AutoModerationCommand {}
