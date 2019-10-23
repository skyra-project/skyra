import { CommandOptions } from 'klasa';
import { SelfModerationCommand } from '../../../lib/structures/SelfModerationCommand';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';
import { GuildSecurity } from '../../../lib/util/Security/GuildSecurity';
import { ApplyOptions } from '../../../lib/util/util';

@ApplyOptions<CommandOptions>({
	aliases: ['newline-mode', 'nl-mode'],
	description: language => language.tget('COMMAND_NEWLINEMODE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_NEWLINEMODE_EXTENDED')
})
export default class extends SelfModerationCommand {

	protected $adder: keyof GuildSecurity['adders'] = 'newlines';
	protected keyEnabled = GuildSettings.Selfmod.NewLines.Enabled;
	protected keySoftAction = GuildSettings.Selfmod.NewLines.SoftAction;
	protected keyHardAction = GuildSettings.Selfmod.NewLines.HardAction;
	protected keyHardActionDuration = GuildSettings.Selfmod.NewLines.HardActionDuration;
	protected keyThresholdMaximum = GuildSettings.Selfmod.NewLines.ThresholdMaximum;
	protected keyThresholdDuration = GuildSettings.Selfmod.NewLines.ThresholdDuration;

}
