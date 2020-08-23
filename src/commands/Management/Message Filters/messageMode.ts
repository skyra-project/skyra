import { SelfModerationCommand } from '@lib/structures/SelfModerationCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { CommandStore } from 'klasa';

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
			description: (language) => language.get('commandMessageModeDescription'),
			extendedHelp: (language) => language.get('commandMessageModeExtended')
		});
	}
}
