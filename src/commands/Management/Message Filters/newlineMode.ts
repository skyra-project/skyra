import { AdderKey, GuildEntity, GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';
import type { PickByValue } from '@sapphire/utilities';

@ApplyOptions<SelfModerationCommand.Options>({
	aliases: ['newline-mode', 'nl-mode'],
	description: LanguageKeys.Commands.Management.NewlineModeDescription,
	detailedDescription: LanguageKeys.Commands.Management.NewlineModeExtended
})
export class UserSelfModerationCommand extends SelfModerationCommand {
	protected $adder: AdderKey = 'newlines';
	protected keyEnabled: PickByValue<GuildEntity, boolean> = GuildSettings.Selfmod.NewLines.Enabled;
	protected keySoftAction: PickByValue<GuildEntity, number> = GuildSettings.Selfmod.NewLines.SoftAction;
	protected keyHardAction: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.NewLines.HardAction;
	protected keyHardActionDuration: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.NewLines.HardActionDuration;
	protected keyThresholdMaximum: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.NewLines.ThresholdMaximum;
	protected keyThresholdDuration: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.NewLines.ThresholdDuration;
}
