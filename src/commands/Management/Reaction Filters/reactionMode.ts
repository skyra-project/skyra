import { GuildEntity } from '@lib/database';
import { SelfModerationCommand } from '@lib/structures/SelfModerationCommand';
import { KeyOfType } from '@lib/types';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { CommandOptions } from 'klasa';

@ApplyOptions<CommandOptions>({
	aliases: ['reaction-mode', 'r-mode'],
	description: (language) => language.get(LanguageKeys.Commands.Management.ReactionModeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.ReactionModeExtended)
})
export default class extends SelfModerationCommand {
	protected $adder: keyof GuildSecurity['adders'] = 'reactions';
	protected keyEnabled: KeyOfType<GuildEntity, boolean> = GuildSettings.Selfmod.Reactions.Enabled;
	protected keySoftAction: KeyOfType<GuildEntity, number> = GuildSettings.Selfmod.Reactions.SoftAction;
	protected keyHardAction: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Reactions.HardAction;
	protected keyHardActionDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Reactions.HardActionDuration;
	protected keyThresholdMaximum: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Reactions.ThresholdMaximum;
	protected keyThresholdDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Reactions.ThresholdDuration;
}
