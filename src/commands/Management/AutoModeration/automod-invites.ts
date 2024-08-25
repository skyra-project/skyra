import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AutoModerationCommand } from '#lib/moderation';
import { ApplyOptions } from '@sapphire/decorators';

const Root = LanguageKeys.Commands.AutoModeration;

@ApplyOptions<AutoModerationCommand.Options>({
	aliases: ['invite-mode', 'invites-mode', 'manage-invite', 'manage-invites'],
	description: Root.InvitesDescription,
	localizedNameKey: Root.InvitesName,
	adderPropertyName: 'invites',
	keyEnabled: 'selfmodInvitesEnabled',
	keyOnInfraction: 'selfmodInvitesSoftAction',
	keyPunishment: 'selfmodInvitesHardAction',
	keyPunishmentDuration: 'selfmodInvitesHardActionDuration',
	keyPunishmentThreshold: 'selfmodInvitesThresholdMaximum',
	keyPunishmentThresholdPeriod: 'selfmodInvitesThresholdDuration',
	idHints: [
		'1277288831913037824' // skyra-beta production
	]
})
export class UserAutoModerationCommand extends AutoModerationCommand {}
