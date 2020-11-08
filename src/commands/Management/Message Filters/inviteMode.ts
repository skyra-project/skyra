import { GuildEntity, GuildSettings } from '@lib/database';
import { SelfModerationCommand } from '@lib/structures/SelfModerationCommand';
import { KeyOfType } from '@lib/types';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { CommandOptions } from 'klasa';

@ApplyOptions<CommandOptions>({
	aliases: ['invites-mode', 'inv-mode'],
	description: (language) => language.get(LanguageKeys.Commands.Management.InviteModeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.InviteModeExtended)
})
export default class extends SelfModerationCommand {
	protected $adder: keyof GuildSecurity['adders'] = 'invites';
	protected keyEnabled: KeyOfType<GuildEntity, boolean> = GuildSettings.Selfmod.Invites.Enabled;
	protected keySoftAction: KeyOfType<GuildEntity, number> = GuildSettings.Selfmod.Invites.SoftAction;
	protected keyHardAction: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Invites.HardAction;
	protected keyHardActionDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Invites.HardActionDuration;
	protected keyThresholdMaximum: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Invites.ThresholdMaximum;
	protected keyThresholdDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Invites.ThresholdDuration;
}
