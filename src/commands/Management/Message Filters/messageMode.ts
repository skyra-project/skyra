import { GuildSettings, type AdderKey, type GuildSettingsOfType } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SelfModerationCommand.Options>({
	aliases: ['message-mode', 'msg-mode', 'm-mode'],
	description: LanguageKeys.Commands.Management.MessageModeDescription,
	detailedDescription: LanguageKeys.Commands.Management.MessageModeExtended
})
export class UserSelfModerationCommand extends SelfModerationCommand {
	protected $adder: AdderKey = 'messages';
	protected keyEnabled: GuildSettingsOfType<boolean> = GuildSettings.Selfmod.Messages.Enabled;
	protected keySoftAction: GuildSettingsOfType<number> = GuildSettings.Selfmod.Messages.SoftAction;
	protected keyHardAction: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Messages.HardAction;
	protected keyHardActionDuration: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Messages.HardActionDuration;
	protected keyThresholdMaximum: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Messages.ThresholdMaximum;
	protected keyThresholdDuration: GuildSettingsOfType<number | null> = GuildSettings.Selfmod.Messages.ThresholdDuration;
}
