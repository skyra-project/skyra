import { CommandStore } from 'klasa';
import { SelfModerationCommand } from '../../../lib/structures/SelfModerationCommand';
import { GuildSecurity } from '../../../lib/util/Security/GuildSecurity';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';

export default class extends SelfModerationCommand {

	protected $adder: keyof GuildSecurity['adders'] = 'capitals';
	protected keyEnabled = GuildSettings.Selfmod.Capitals.Enabled;
	protected keySoftAction = GuildSettings.Selfmod.Capitals.SoftAction;
	protected keyHardAction = GuildSettings.Selfmod.Capitals.HardAction;
	protected keyHardActionDuration = GuildSettings.Selfmod.Capitals.HardActionDuration;
	protected keyThresholdMaximum = GuildSettings.Selfmod.Capitals.ThresholdMaximum;
	protected keyThresholdDuration = GuildSettings.Selfmod.Capitals.ThresholdDuration;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.get('COMMAND_SETCAPSFILTER_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_SETCAPSFILTER_EXTENDED')
		});
	}

}
