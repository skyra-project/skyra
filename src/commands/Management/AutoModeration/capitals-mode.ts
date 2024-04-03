import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

const Root = LanguageKeys.Commands.Management;
const SettingsRoot = GuildSettings.Selfmod.Capitals;

@ApplyOptions<SelfModerationCommand.Options>({
	description: Root.CapitalsDescription,
	localizedNameKey: Root.CapitalsName,
	adderPropertyName: 'capitals',
	keyEnabled: SettingsRoot.Enabled,
	keyOnInfraction: SettingsRoot.SoftAction,
	keyPunishment: SettingsRoot.HardAction,
	keyPunishmentDuration: SettingsRoot.HardActionDuration,
	keyPunishmentThreshold: SettingsRoot.ThresholdMaximum,
	keyPunishmentThresholdPeriod: SettingsRoot.ThresholdDuration
})
export class UserSelfModerationCommand extends SelfModerationCommand {}
