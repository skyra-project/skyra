import { FT, T } from '#lib/types';
import { LanguageHelpDisplayOptions } from '#utils/LanguageHelp';

export const HelpAllFlag = FT<{ prefix: string }, string>('commands/general:helpAllFlag');
export const HelpCommandCount = FT<{ count: number }, string>('commands/general:helpCommandCount');
export const HelpCommandCountPlural = FT<{ count: number }, string>('commands/general:helpCommandCountPlural');
export const HelpDescription = T<string>('commands/general:helpDescription');
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
>('commands/general:helpData');
export const HelpDm = T<string>('commands/general:helpDm');
export const HelpNodm = T<string>('commands/general:helpNodm');
export const HelpNoExtended = T<string>('commands/general:helpNoExtended');
export const InfoBody = T<string[]>('commands/general:infoBody');
export const InfoDescription = T<string>('commands/general:infoDescription');
export const InviteDescription = T<string>('commands/general:inviteDescription');
export const InviteExtended = T<LanguageHelpDisplayOptions>('commands/general:inviteExtended');
export const InvitePermissionInviteText = T<string>('commands/general:invitePermissionInviteText');
export const InvitePermissionsDescription = T<string>('commands/general:invitePermissionsDescription');
export const InvitePermissionSupportServerText = T<string>('commands/general:invitePermissionSupportServerText');
export const Ping = T<string>('commands/general:ping');
export const PingDescription = T<string>('commands/general:pingDescription');
export const PingPong = FT<{ diff: number; ping: number }, string>('commands/general:pingPong');
