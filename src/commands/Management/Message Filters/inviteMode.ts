import { CommandOptions } from 'klasa';
import { SelfModerationCommand } from '../../../lib/structures/SelfModerationCommand';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';
import { GuildSecurity } from '../../../lib/util/Security/GuildSecurity';
import { ApplyOptions } from '../../../lib/util/util';

@ApplyOptions<CommandOptions>({
	aliases: ['invites-mode', 'inv-mode'],
	description: language => language.tget('COMMAND_INVITEMODE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_INVITEMODE_EXTENDED')
})
export default class extends SelfModerationCommand {

	protected $adder: keyof GuildSecurity['adders'] = 'invites';
	protected keyEnabled = GuildSettings.Selfmod.Invites.Enabled;
	protected keySoftAction = GuildSettings.Selfmod.Invites.SoftAction;
	protected keyHardAction = GuildSettings.Selfmod.Invites.HardAction;
	protected keyHardActionDuration = GuildSettings.Selfmod.Invites.HardActionDuration;
	protected keyThresholdMaximum = GuildSettings.Selfmod.Invites.ThresholdMaximum;
	protected keyThresholdDuration = GuildSettings.Selfmod.Invites.ThresholdDuration;

}
