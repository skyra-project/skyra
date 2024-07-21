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
	keyPunishmentThresholdPeriod: 'selfmodLinksThresholdDuration'
})
export class UserAutoModerationCommand extends AutoModerationCommand {}
