import type { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';

export const HelpAllFlag = FT<{ prefix: string }, string>('commands/general:helpAllFlag');
export const HelpCommandCount = FT<{ count: number }, string>('commands/general:helpCommandCount');
export const HelpData = FT<{ titleDescription: string; footerName: string }, { title: string; footer: string }>('commands/general:helpData');
export const HelpDescription = T('commands/general:helpDescription');
export const HelpDm = T('commands/general:helpDm');
export const HelpExtended = T<LanguageHelpDisplayOptions>('commands/general:helpExtended');
export const HelpNoDm = T('commands/general:helpNodm');
export const InfoBody = T('commands/general:infoBody');
export const InfoDescription = T('commands/general:infoDescription');
export const InfoExtended = T<LanguageHelpDisplayOptions>('commands/general:infoExtended');
export const InfoTitles = T<{ stats: string; uptime: string; serverUsage: string }>('commands/general:infoTitles');
export const InfoFields = FT<{ stats: StatsGeneral; uptime: StatsUptime; usage: StatsUsage }, { stats: string; uptime: string; serverUsage: string }>(
	'commands/general:infoFields'
);
export const InfoComponentLabels = T<InfoComponentLabels>('commands/general:infoComponentLabels');
export const InviteDescription = T('commands/general:inviteDescription');
export const InviteExtended = T<LanguageHelpDisplayOptions>('commands/general:inviteExtended');
export const InvitePermissionInviteText = T('commands/general:invitePermissionInviteText');
export const InvitePermissionsDescription = T('commands/general:invitePermissionsDescription');
export const InvitePermissionSupportServerText = T('commands/general:invitePermissionSupportServerText');
export const V7Description = T('commands/general:v7Description');
export const V7Extended = T<LanguageHelpDisplayOptions>('commands/general:v7Extended');
export const V7Message = FT<{ command: string }>('commands/general:v7Message');
export const V7NayreMessage = FT<{ command: string }>('commands/general:v7NayreMessage');

export interface InfoComponentLabels {
	addToServer: string;
	supportServer: string;
	repository: string;
	donate: string;
}

export interface StatsGeneral {
	channels: number;
	guilds: number;
	nodeJs: string;
	users: number;
	djsVersion: string;
	sapphireVersion: string;
}

export interface StatsUptime {
	client: string;
	host: string;
	total: string;
}

export interface StatsUsage {
	cpuLoad: string;
	ramTotal: number;
	ramUsed: number;
}
