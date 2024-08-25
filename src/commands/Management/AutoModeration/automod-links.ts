import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AutoModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

const Root = LanguageKeys.Commands.AutoModeration;

@ApplyOptions<AutoModerationCommand.Options>({
	aliases: ['link-mode', 'links-mode', 'manage-link', 'manage-links'],
	description: Root.LinksDescription,
	localizedNameKey: Root.LinksName,
	adderPropertyName: 'links',
	keyEnabled: 'selfmodLinksEnabled',
	keyOnInfraction: 'selfmodLinksSoftAction',
	keyPunishment: 'selfmodLinksHardAction',
	keyPunishmentDuration: 'selfmodLinksHardActionDuration',
	keyPunishmentThreshold: 'selfmodLinksThresholdMaximum',
	keyPunishmentThresholdPeriod: 'selfmodLinksThresholdDuration',
	idHints: [
		'1277288910216499210' // skyra-beta production
	]
})
export class UserAutoModerationCommand extends AutoModerationCommand {}
