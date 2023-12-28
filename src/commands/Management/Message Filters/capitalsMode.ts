import { GuildSettings, type AdderKey, type GuildSettingsOfType } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SelfModerationCommand.Options>({
	aliases: ['capitals-mode', 'caps-mode'],
	description: LanguageKeys.Commands.Management.CapitalsModeDescription,
	detailedDescription: LanguageKeys.Commands.Management.CapitalsModeExtended
})
export class UserSelfModerationCommand extends SelfModerationCommand {
	protected $adder: AdderKey = 'capitals';
	protected keyEnabled: GuildSettingsOfType<boolean> = GuildSettings.Selfmod.Capitals.Enabled;
	protected keySoftAction: GuildSettingsOfType<number> = GuildSettings.Selfmod.Capitals.SoftAction;
	protected keyHardAction: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Capitals.HardAction;
	protected keyHardActionDuration: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Capitals.HardActionDuration;
	protected keyThresholdMaximum: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Capitals.ThresholdMaximum;
	protected keyThresholdDuration: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Capitals.ThresholdDuration;
}
