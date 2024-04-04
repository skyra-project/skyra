import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AutoModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

const Root = LanguageKeys.Commands.AutoModeration;
const SettingsRoot = GuildSettings.AutoModeration.NewLines;

@ApplyOptions<AutoModerationCommand.Options>({
	description: Root.NewlinesDescription,
	localizedNameKey: Root.NewlinesName,
	adderPropertyName: 'newlines',
	keyEnabled: SettingsRoot.Enabled,
	keyOnInfraction: SettingsRoot.SoftAction,
	keyPunishment: SettingsRoot.HardAction,
	keyPunishmentDuration: SettingsRoot.HardActionDuration,
	keyPunishmentThreshold: SettingsRoot.ThresholdMaximum,
	keyPunishmentThresholdPeriod: SettingsRoot.ThresholdDuration
})
export class UserAutoModerationCommand extends AutoModerationCommand {}
