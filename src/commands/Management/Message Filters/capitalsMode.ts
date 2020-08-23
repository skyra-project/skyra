import { SelfModerationCommand } from '@lib/structures/SelfModerationCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { CommandStore } from 'klasa';

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
			aliases: ['capitals-mode', 'caps-mode'],
			description: (language) => language.get('commandCapitalsModeDescription'),
			extendedHelp: (language) => language.get('commandCapitalsModeExtended')
		});
	}
}
