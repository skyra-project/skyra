import { GuildEntity, GuildSettings } from '@lib/database';
import { SelfModerationCommand } from '@lib/structures/SelfModerationCommand';
import { KeyOfType } from '@lib/types';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { CommandOptions } from 'klasa';

@ApplyOptions<CommandOptions>({
	aliases: ['link-mode', 'lmode', 'linkfilter', 'extlinks', 'externallinks'],
	description: (language) => language.get(LanguageKeys.Commands.Management.LinkModeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.LinkModeExtended)
})
export default class extends SelfModerationCommand {
	protected $adder: keyof GuildSecurity['adders'] = 'links';
	protected keyEnabled: KeyOfType<GuildEntity, boolean> = GuildSettings.Selfmod.Links.Enabled;
	protected keySoftAction: KeyOfType<GuildEntity, number> = GuildSettings.Selfmod.Links.SoftAction;
	protected keyHardAction: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Links.HardAction;
	protected keyHardActionDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Links.HardActionDuration;
	protected keyThresholdMaximum: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Links.ThresholdMaximum;
	protected keyThresholdDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Links.ThresholdDuration;
}
