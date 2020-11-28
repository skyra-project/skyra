import { AdderKey, GuildEntity, GuildSettings } from '#lib/database/index';
import { SelfModerationCommand } from '#lib/structures/SelfModerationCommand';
import { KeyOfType } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { CommandOptions } from 'klasa';

@ApplyOptions<CommandOptions>({
	aliases: ['attachment-mode', 'attachments-mode', 'att-mode', 'manageAttachment', 'manageattachment'],
	description: (language) => language.get(LanguageKeys.Commands.Management.AttachmentsModeDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Management.AttachmentsModeExtended)
})
export default class extends SelfModerationCommand {
	protected $adder: AdderKey = 'attachments';
	protected keyEnabled: KeyOfType<GuildEntity, boolean> = GuildSettings.Selfmod.Attachments.Enabled;
	protected keySoftAction: KeyOfType<GuildEntity, number> = GuildSettings.Selfmod.Attachments.SoftAction;
	protected keyHardAction: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Attachments.HardAction;
	protected keyHardActionDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Attachments.HardActionDuration;
	protected keyThresholdMaximum: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Attachments.ThresholdMaximum;
	protected keyThresholdDuration: KeyOfType<GuildEntity, number | null> = GuildSettings.Selfmod.Attachments.ThresholdDuration;
}
