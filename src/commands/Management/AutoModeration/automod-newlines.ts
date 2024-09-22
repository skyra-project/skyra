import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AutoModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

const Root = LanguageKeys.Commands.AutoModeration;

@ApplyOptions<AutoModerationCommand.Options>({
	aliases: ['newline-mode', 'newlines-mode', 'manage-newline', 'manage-newlines'],
	description: Root.NewlinesDescription,
	localizedNameKey: Root.NewlinesName,
	adderPropertyName: 'newlines',
	keyEnabled: 'selfmodNewlinesEnabled',
	keyOnInfraction: 'selfmodNewlinesSoftAction',
	keyPunishment: 'selfmodNewlinesHardAction',
	keyPunishmentDuration: 'selfmodNewlinesHardActionDuration',
	keyPunishmentThreshold: 'selfmodNewlinesThresholdMaximum',
	keyPunishmentThresholdPeriod: 'selfmodNewlinesThresholdDuration',
	idHints: [
		'1226164940306383020', // skyra production
		'1277288823491137639' // skyra-beta production
	]
})
export class UserAutoModerationCommand extends AutoModerationCommand {}
