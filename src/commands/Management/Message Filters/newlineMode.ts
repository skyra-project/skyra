import { AdderKey, GuildEntity, GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/structures/commands/SelfModerationCommand';
import type { SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import type { KeyOfType } from '#lib/types';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['newline-mode', 'nl-mode'],
	description: LanguageKeys.Commands.Management.NewlineModeDescription,
	extendedHelp: LanguageKeys.Commands.Management.NewlineModeExtended
})
export default class extends SelfModerationCommand {
	protected $adder: AdderKey = 'newlines';
	protected keyEnabled: KeyOfType<GuildEntity, boolean> = GuildSettings.Selfmod.NewLines.Enabled;
	protected keySoftAction: KeyOfType<GuildEntity, number> = GuildSettings.Selfmod.NewLines.SoftAction;
	protected keyHardAction: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.NewLines.HardAction;
	protected keyHardActionDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.NewLines.HardActionDuration;
	protected keyThresholdMaximum: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.NewLines.ThresholdMaximum;
	protected keyThresholdDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.NewLines.ThresholdDuration;
}
