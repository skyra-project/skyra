import { GuildSettings, type AdderKey, type GuildSettingsOfType } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

const Root = LanguageKeys.Commands.Management;
const SettingsRoot = GuildSettings.Selfmod.Filter;

@ApplyOptions<SelfModerationCommand.Options>({
	aliases: ['word-filter-mode', 'manage-filter'],
	description: Root.FilterModeDescription,
	detailedDescription: Root.FilterModeExtended
})
export class UserSelfModerationCommand extends SelfModerationCommand {
	protected $adder: AdderKey = 'words';
	protected keyEnabled: GuildSettingsOfType<boolean> = SettingsRoot.Enabled;
	protected keySoftAction: GuildSettingsOfType<number> = SettingsRoot.SoftAction;
	protected keyHardAction: GuildSettingsOfType<number | null> = SettingsRoot.HardAction;
	protected keyHardActionDuration: GuildSettingsOfType<number | null> = SettingsRoot.HardActionDuration;
	protected keyThresholdMaximum: GuildSettingsOfType<number | null> = SettingsRoot.ThresholdMaximum;
	protected keyThresholdDuration: GuildSettingsOfType<number | null> = SettingsRoot.ThresholdDuration;
}
