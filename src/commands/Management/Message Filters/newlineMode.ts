import { CommandStore } from 'klasa';
import { SelfModerationCommand } from '../../../lib/structures/SelfModerationCommand';
import { GuildSecurity } from '../../../lib/util/Security/GuildSecurity';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';

export default class extends SelfModerationCommand {

	protected $adder: keyof GuildSecurity['adders'] = 'newlines';
	protected keyEnabled = GuildSettings.Selfmod.NewLines.Enabled;
	protected keySoftAction = GuildSettings.Selfmod.NewLines.SoftAction;
	protected keyHardAction = GuildSettings.Selfmod.NewLines.HardAction;
	protected keyHardActionDuration = GuildSettings.Selfmod.NewLines.HardActionDuration;
	protected keyThresholdMaximum = GuildSettings.Selfmod.NewLines.ThresholdMaximum;
	protected keyThresholdDuration = GuildSettings.Selfmod.NewLines.ThresholdDuration;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['newline-mode', 'nl-mode'],
			description: language => language.tget('COMMAND_NEWLINEMODE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_NEWLINEMODE_EXTENDED')
		});
	}

}
