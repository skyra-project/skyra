import { CommandStore } from 'klasa';
import { SelfModerationCommand } from '../../../lib/structures/SelfModerationCommand';
import { GuildSecurity } from '../../../lib/util/Security/GuildSecurity';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';

export default class extends SelfModerationCommand {

	protected $adder: keyof GuildSecurity['adders'] = 'messages';
	protected keyEnabled = GuildSettings.Selfmod.Messages.Enabled;
	protected keySoftAction = GuildSettings.Selfmod.Messages.SoftAction;
	protected keyHardAction = GuildSettings.Selfmod.Messages.HardAction;
	protected keyHardActionDuration = GuildSettings.Selfmod.Messages.HardActionDuration;
	protected keyThresholdMaximum = GuildSettings.Selfmod.Messages.ThresholdMaximum;
	protected keyThresholdDuration = GuildSettings.Selfmod.Messages.ThresholdDuration;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['message-mode', 'msg-mode', 'm-mode'],
			description: language => language.tget('COMMAND_MESSAGEMODE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_MESSAGEMODE_EXTENDED')
		});
	}

}
