import { Adders, GuildEntity, GuildSettings } from '@lib/database';
import { SelfModerationCommand } from '@lib/structures/SelfModerationCommand';
import { KeyOfType } from '@lib/types';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { CommandOptions } from 'klasa';

@ApplyOptions<CommandOptions>({
	aliases: ['capitals-mode', 'caps-mode'],
	description: (language) => language.get(LanguageKeys.Commands.Management.CapitalsModeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.CapitalsModeExtended)
})
export default class extends SelfModerationCommand {
	protected $adder: keyof Adders = 'capitals';
	protected keyEnabled: KeyOfType<GuildEntity, boolean> = GuildSettings.Selfmod.Capitals.Enabled;
	protected keySoftAction: KeyOfType<GuildEntity, number> = GuildSettings.Selfmod.Capitals.SoftAction;
	protected keyHardAction: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Capitals.HardAction;
	protected keyHardActionDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Capitals.HardActionDuration;
	protected keyThresholdMaximum: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Capitals.ThresholdMaximum;
	protected keyThresholdDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Capitals.ThresholdDuration;
}
