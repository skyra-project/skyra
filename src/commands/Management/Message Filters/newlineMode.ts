import { AdderKey, GuildEntity, GuildSettings } from '#lib/database/index';
import { SelfModerationCommand } from '#lib/structures/SelfModerationCommand';
import { KeyOfType } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { CommandOptions } from 'klasa';

@ApplyOptions<CommandOptions>({
	aliases: ['newline-mode', 'nl-mode'],
	description: (language) => language.get(LanguageKeys.Commands.Management.NewlineModeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.NewlineModeExtended)
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
