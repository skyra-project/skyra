import { SelfModerationCommand } from '@lib/structures/SelfModerationCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { CommandStore } from 'klasa';

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
			description: (language) => language.get('commandFilterModeDescription'),
			extendedHelp: (language) => language.get('commandFilterModeExtended')
		});
	}
}
