import { GuildEntity } from '@lib/database';
import { SelfModerationCommand } from '@lib/structures/SelfModerationCommand';
import { KeyOfType } from '@lib/types';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { GuildSecurity } from '@utils/Security/GuildSecurity';
import { CommandOptions } from 'klasa';

@ApplyOptions<CommandOptions>({
	aliases: ['message-mode', 'msg-mode', 'm-mode'],
	description: (language) => language.get(LanguageKeys.Commands.Management.MessageModeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.MessageModeExtended)
})
export default class extends SelfModerationCommand {
	protected $adder: keyof GuildSecurity['adders'] = 'messages';
	protected keyEnabled: KeyOfType<GuildEntity, boolean> = GuildSettings.Selfmod.Messages.Enabled;
	protected keySoftAction: KeyOfType<GuildEntity, number> = GuildSettings.Selfmod.Messages.SoftAction;
	protected keyHardAction: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Messages.HardAction;
	protected keyHardActionDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Messages.HardActionDuration;
	protected keyThresholdMaximum: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Messages.ThresholdMaximum;
	protected keyThresholdDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Messages.ThresholdDuration;
}
