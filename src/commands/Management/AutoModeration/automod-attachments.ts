import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AutoModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

const Root = LanguageKeys.Commands.AutoModeration;

@ApplyOptions<AutoModerationCommand.Options>({
	aliases: ['attachment-mode', 'attachments-mode', 'manage-attachment', 'manage-attachments'],
	description: Root.AttachmentsDescription,
	localizedNameKey: Root.AttachmentsName,
	adderPropertyName: 'attachments',
	keyEnabled: 'selfmodAttachmentsEnabled',
	keyOnInfraction: 'selfmodAttachmentsSoftAction',
	keyPunishment: 'selfmodAttachmentsHardAction',
	keyPunishmentDuration: 'selfmodAttachmentsHardActionDuration',
	keyPunishmentThreshold: 'selfmodAttachmentsThresholdMaximum',
	keyPunishmentThresholdPeriod: 'selfmodAttachmentsThresholdDuration',
	idHints: [
		'1277288829421748234' // skyra-beta production
	]
})
export class UserAutoModerationCommand extends AutoModerationCommand {}
