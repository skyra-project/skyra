import { AdderKey, GuildEntity, GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SelfModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';
import { PickByValue } from '@sapphire/utilities';

@ApplyOptions<SelfModerationCommand.Options>({
	aliases: ['attachment-mode', 'attachments-mode', 'att-mode', 'manageAttachment', 'manageattachment'],
	description: LanguageKeys.Commands.Management.AttachmentsModeDescription,
	extendedHelp: LanguageKeys.Commands.Management.AttachmentsModeExtended
})
export class UserSelfModerationCommand extends SelfModerationCommand {
	protected $adder: AdderKey = 'attachments';
	protected keyEnabled: PickByValue<GuildEntity, boolean> = GuildSettings.Selfmod.Attachments.Enabled;
	protected keySoftAction: PickByValue<GuildEntity, number> = GuildSettings.Selfmod.Attachments.SoftAction;
	protected keyHardAction: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.Attachments.HardAction;
	protected keyHardActionDuration: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.Attachments.HardActionDuration;
	protected keyThresholdMaximum: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.Attachments.ThresholdMaximum;
	protected keyThresholdDuration: PickByValue<GuildEntity, number | null> = GuildSettings.Selfmod.Attachments.ThresholdDuration;
}
