import { SelfModerationCommand } from '@lib/structures/SelfModerationCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { CommandStore } from 'klasa';

export default class extends SelfModerationCommand {
	protected $adder: keyof GuildSecurity['adders'] = 'reactions';
	protected keyEnabled = GuildSettings.Selfmod.Reactions.Enabled;
	protected keySoftAction = GuildSettings.Selfmod.Reactions.SoftAction;
	protected keyHardAction = GuildSettings.Selfmod.Reactions.HardAction;
	protected keyHardActionDuration = GuildSettings.Selfmod.Reactions.HardActionDuration;
	protected keyThresholdMaximum = GuildSettings.Selfmod.Reactions.ThresholdMaximum;
	protected keyThresholdDuration = GuildSettings.Selfmod.Reactions.ThresholdDuration;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['reaction-mode', 'r-mode'],
			description: (language) => language.get('commandReactionModeDescription'),
			extendedHelp: (language) => language.get('commandReactionModeExtended')
		});
	}
}
