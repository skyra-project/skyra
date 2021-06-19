import { AdderKey, GuildEntity, GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';
import type { PickByValue } from '@sapphire/utilities';

@ApplyOptions<SelfModerationCommand.Options>({
	aliases: ['message-mode', 'msg-mode', 'm-mode'],
	description: LanguageKeys.Commands.Management.MessageModeDescription,
	extendedHelp: LanguageKeys.Commands.Management.MessageModeExtended
})
export class UserSelfModerationCommand extends SelfModerationCommand {
	protected $adder: AdderKey = 'messages';
	protected keyEnabled: PickByValue<GuildEntity, boolean> = GuildSettings.Selfmod.Messages.Enabled;
	protected keySoftAction: PickByValue<GuildEntity, number> = GuildSettings.Selfmod.Messages.SoftAction;
	protected keyHardAction: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.Messages.HardAction;
	protected keyHardActionDuration: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.Messages.HardActionDuration;
	protected keyThresholdMaximum: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.Messages.ThresholdMaximum;
	protected keyThresholdDuration: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.Messages.ThresholdDuration;
}
