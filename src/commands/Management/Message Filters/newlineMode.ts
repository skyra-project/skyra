import { GuildSettings, type AdderKey, type GuildSettingsOfType } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SelfModerationCommand.Options>({
	aliases: ['newline-mode', 'nl-mode'],
	description: LanguageKeys.Commands.Management.NewlineModeDescription,
	detailedDescription: LanguageKeys.Commands.Management.NewlineModeExtended
})
export class UserSelfModerationCommand extends SelfModerationCommand {
	protected $adder: AdderKey = 'newlines';
	protected keyEnabled: GuildSettingsOfType<boolean> = GuildSettings.Selfmod.NewLines.Enabled;
	protected keySoftAction: GuildSettingsOfType<number> = GuildSettings.Selfmod.NewLines.SoftAction;
	protected keyHardAction: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.NewLines.HardAction;
	protected keyHardActionDuration: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.NewLines.HardActionDuration;
	protected keyThresholdMaximum: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.NewLines.ThresholdMaximum;
	protected keyThresholdDuration: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.NewLines.ThresholdDuration;
}
