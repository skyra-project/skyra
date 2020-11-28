import { FT, T } from '#lib/types/index';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';

export const Ping = T<string>('commandPing');
export const PingDescription = T<string>('commandPingDescription');
export const PingPong = FT<{ diff: number; ping: number }, string>('commandPingPong');
export const InfoDescription = T<string>('commandInfoDescription');
export const HelpDescription = T<string>('commandHelpDescription');
export const HelpNoExtended = T<string>('commandHelpNoExtended');
export const HelpDm = T<string>('commandHelpDm');
export const HelpNodm = T<string>('commandHelpNodm');
export const HelpAllFlag = FT<{ prefix: string }, string>('commandHelpAllFlag');
export const HelpCommandCount = FT<{ count: number }, string>('commandHelpCommandCount');
export const HelpCommandCountPlural = FT<{ count: number }, string>('commandHelpCommandCountPlural');
export const InviteDescription = T<string>('commandInviteDescription');
export const InviteExtended = T<LanguageHelpDisplayOptions>('commandInviteExtended');
export const InvitePermissionInviteText = T<string>('commandInvitePermissionInviteText');
export const InvitePermissionSupportServerText = T<string>('commandInvitePermissionSupportServerText');
export const InvitePermissionsDescription = T<string>('commandInvitePermissionsDescription');
export const InfoBody = T<string[]>('commandInfoBody');
export const HelpData = FT<
	{
		titleDescription: string;
		usage: string;
		extendedHelp: string;
		footerName: string;
	},
	{
		title: string;
		usage: string;
		extended: string;
		footer: string;
	}
>('commandHelpData');
