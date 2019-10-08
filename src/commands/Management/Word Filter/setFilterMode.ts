import { CommandStore } from 'klasa';
import { SelfModerationCommand } from '../../../lib/structures/SelfModerationCommand';
import { GuildSecurity } from '../../../lib/util/Security/GuildSecurity';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';

export default class extends SelfModerationCommand {

	protected $adder: keyof GuildSecurity['adders'] = 'words';
	protected keyEnabled = GuildSettings.Selfmod.Filter.Enabled;
	protected keySoftAction = GuildSettings.Selfmod.Filter.SoftAction;
	protected keyHardAction = GuildSettings.Selfmod.Filter.HardAction;
	protected keyHardActionDuration = GuildSettings.Selfmod.Filter.HardActionDuration;
	protected keyThresholdMaximum = GuildSettings.Selfmod.Filter.ThresholdMaximum;
	protected keyThresholdDuration = GuildSettings.Selfmod.Filter.ThresholdDuration;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.get('COMMAND_SETFILTERMODE_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_SETFILTERMODE_EXTENDED')
		});
	}

}
