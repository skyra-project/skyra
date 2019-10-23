import { CommandOptions } from 'klasa';
import { SelfModerationCommand } from '../../../lib/structures/SelfModerationCommand';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';
import { GuildSecurity } from '../../../lib/util/Security/GuildSecurity';
import { ApplyOptions } from '../../../lib/util/util';

@ApplyOptions<CommandOptions>({
	aliases: ['capitals-mode', 'caps-mode'],
	description: language => language.tget('COMMAND_CAPITALSMODE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_CAPITALSMODE_EXTENDED')
})
export default class extends SelfModerationCommand {

	protected $adder: keyof GuildSecurity['adders'] = 'capitals';
	protected keyEnabled = GuildSettings.Selfmod.Capitals.Enabled;
	protected keySoftAction = GuildSettings.Selfmod.Capitals.SoftAction;
	protected keyHardAction = GuildSettings.Selfmod.Capitals.HardAction;
	protected keyHardActionDuration = GuildSettings.Selfmod.Capitals.HardActionDuration;
	protected keyThresholdMaximum = GuildSettings.Selfmod.Capitals.ThresholdMaximum;
	protected keyThresholdDuration = GuildSettings.Selfmod.Capitals.ThresholdDuration;

}
