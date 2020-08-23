import { SelfModerationCommand } from '@lib/structures/SelfModerationCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { CommandStore } from 'klasa';

export default class extends SelfModerationCommand {
	protected $adder: keyof GuildSecurity['adders'] = 'links';
	protected keyEnabled = GuildSettings.Selfmod.Links.Enabled;
	protected keySoftAction = GuildSettings.Selfmod.Links.SoftAction;
	protected keyHardAction = GuildSettings.Selfmod.Links.HardAction;
	protected keyHardActionDuration = GuildSettings.Selfmod.Links.HardActionDuration;
	protected keyThresholdMaximum = GuildSettings.Selfmod.Links.ThresholdMaximum;
	protected keyThresholdDuration = GuildSettings.Selfmod.Links.ThresholdDuration;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['link-mode', 'lmode', 'linkfilter', 'extlinks', 'externallinks'],
			description: (language) => language.get('commandLinkModeDescription'),
			extendedHelp: (language) => language.get('commandLinkModeExtended')
		});
	}
}
