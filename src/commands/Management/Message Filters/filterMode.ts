import { CommandOptions } from 'klasa';
import { SelfModerationCommand } from '../../../lib/structures/SelfModerationCommand';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';
import { GuildSecurity } from '../../../lib/util/Security/GuildSecurity';
import { ApplyOptions } from '../../../lib/util/util';

@ApplyOptions<CommandOptions>({
	aliases: ['word-filter-mode'],
	description: language => language.tget('COMMAND_FILTERMODE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_FILTERMODE_EXTENDED')
})
export default class extends SelfModerationCommand {

	protected $adder: keyof GuildSecurity['adders'] = 'words';
	protected keyEnabled = GuildSettings.Selfmod.Filter.Enabled;
	protected keySoftAction = GuildSettings.Selfmod.Filter.SoftAction;
	protected keyHardAction = GuildSettings.Selfmod.Filter.HardAction;
	protected keyHardActionDuration = GuildSettings.Selfmod.Filter.HardActionDuration;
	protected keyThresholdMaximum = GuildSettings.Selfmod.Filter.ThresholdMaximum;
	protected keyThresholdDuration = GuildSettings.Selfmod.Filter.ThresholdDuration;

}
