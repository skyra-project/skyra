import { GuildSettings, type AdderKey, type GuildSettingsOfType } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SelfModerationCommand.Options>({
	aliases: ['link-mode', 'lmode', 'linkfilter', 'extlinks', 'externallinks'],
	description: LanguageKeys.Commands.Management.LinkModeDescription,
	detailedDescription: LanguageKeys.Commands.Management.LinkModeExtended
})
export class UserSelfModerationCommand extends SelfModerationCommand {
	protected $adder: AdderKey = 'links';
	protected keyEnabled: GuildSettingsOfType<boolean> = GuildSettings.Selfmod.Links.Enabled;
	protected keySoftAction: GuildSettingsOfType<number> = GuildSettings.Selfmod.Links.SoftAction;
	protected keyHardAction: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Links.HardAction;
	protected keyHardActionDuration: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Links.HardActionDuration;
	protected keyThresholdMaximum: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Links.ThresholdMaximum;
	protected keyThresholdDuration: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Links.ThresholdDuration;
}
