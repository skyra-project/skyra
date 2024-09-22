import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AutoModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

const Root = LanguageKeys.Commands.AutoModeration;

@ApplyOptions<AutoModerationCommand.Options>({
	aliases: ['reaction-mode', 'r-mode'],
	description: Root.ReactionsDescription,
	localizedNameKey: Root.ReactionsName,
	adderPropertyName: 'reactions',
	keyEnabled: 'selfmodReactionsEnabled',
	keyOnInfraction: 'selfmodReactionsSoftAction',
	keyPunishment: 'selfmodReactionsHardAction',
	keyPunishmentDuration: 'selfmodReactionsHardActionDuration',
	keyPunishmentThreshold: 'selfmodReactionsThresholdMaximum',
	keyPunishmentThresholdPeriod: 'selfmodReactionsThresholdDuration',
	idHints: [
		'1226164940306383019', // skyra production
		'1277288820399669309' // skyra-beta production
	]
})
export class UserAutoModerationCommand extends AutoModerationCommand {}
