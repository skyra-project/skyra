import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AutoModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

const Root = LanguageKeys.Commands.AutoModeration;

@ApplyOptions<AutoModerationCommand.Options>({
	aliases: ['message-mode', 'messages-mode', 'manage-message', 'manage-messages'],
	description: Root.SpamDescription,
	localizedNameKey: Root.SpamName,
	adderPropertyName: 'messages',
	keyEnabled: 'selfmodMessagesEnabled',
	keyOnInfraction: 'selfmodMessagesSoftAction',
	keyPunishment: 'selfmodMessagesHardAction',
	keyPunishmentDuration: 'selfmodMessagesHardActionDuration',
	keyPunishmentThreshold: 'selfmodMessagesThresholdMaximum',
	keyPunishmentThresholdPeriod: 'selfmodMessagesThresholdDuration'
})
export class UserAutoModerationCommand extends AutoModerationCommand {}
