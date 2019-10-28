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
			aliases: ['word-filter-mode'],
			description: language => language.tget('COMMAND_FILTERMODE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_FILTERMODE_EXTENDED')
		});
	}

}
