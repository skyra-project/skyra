import { SelfModerationCommand } from '@lib/structures/SelfModerationCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { CommandStore } from 'klasa';

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
			description: (language) => language.get('commandNewlineModeDescription'),
			extendedHelp: (language) => language.get('commandNewlineModeExtended')
		});
	}
}
