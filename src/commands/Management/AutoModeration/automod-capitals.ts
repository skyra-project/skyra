import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AutoModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

const Root = LanguageKeys.Commands.AutoModeration;

@ApplyOptions<AutoModerationCommand.Options>({
	aliases: ['capitals-mode', 'manage-capitals'],
	description: Root.CapitalsDescription,
	localizedNameKey: Root.CapitalsName,
	adderPropertyName: 'capitals',
	keyEnabled: 'selfmodCapitalsEnabled',
	keyOnInfraction: 'selfmodCapitalsSoftAction',
	keyPunishment: 'selfmodCapitalsHardAction',
	keyPunishmentDuration: 'selfmodCapitalsHardActionDuration',
	keyPunishmentThreshold: 'selfmodCapitalsThresholdMaximum',
	keyPunishmentThresholdPeriod: 'selfmodCapitalsThresholdDuration'
})
export class UserAutoModerationCommand extends AutoModerationCommand {}
