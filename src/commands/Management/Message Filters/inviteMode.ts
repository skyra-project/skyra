import { SelfModerationCommand } from '@lib/structures/SelfModerationCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { CommandStore } from 'klasa';

export default class extends SelfModerationCommand {
	protected $adder: keyof GuildSecurity['adders'] = 'invites';
	protected keyEnabled = GuildSettings.Selfmod.Invites.Enabled;
	protected keySoftAction = GuildSettings.Selfmod.Invites.SoftAction;
	protected keyHardAction = GuildSettings.Selfmod.Invites.HardAction;
	protected keyHardActionDuration = GuildSettings.Selfmod.Invites.HardActionDuration;
	protected keyThresholdMaximum = GuildSettings.Selfmod.Invites.ThresholdMaximum;
	protected keyThresholdDuration = GuildSettings.Selfmod.Invites.ThresholdDuration;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['invites-mode', 'inv-mode'],
			description: (language) => language.get('commandInviteModeDescription'),
			extendedHelp: (language) => language.get('commandInviteModeExtended')
		});
	}
}
