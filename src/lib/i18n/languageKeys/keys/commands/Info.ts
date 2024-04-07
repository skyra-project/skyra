import { FT, T } from '#lib/types';

export const Name = T('commands/info:name');
export const Description = T('commands/info:description');

export const EmbedDescription = T('commands/info:embedDescription');
export const EmbedFieldApplicationTitle = T('commands/info:embedFieldApplicationTitle');
export const EmbedFieldApplicationValue = FT<{
	channels: number;
	guilds: number;
	users: number;
	versionDiscord: string;
	versionSapphire: string;
	versionNode: string;
}>('commands/info:embedFieldApplicationValue');
export const EmbedFieldUptimeTitle = T('commands/info:embedFieldUptimeTitle');
export const EmbedFieldUptimeValue = FT<{ host: string; client: string }>('commands/info:embedFieldUptimeValue');
export const EmbedFieldServerUsageTitle = T('commands/info:embedFieldServerUsageTitle');
export const EmbedFieldServerUsageValue = FT<{ cpu: string; heapUsed: string; heapTotal: string }>('commands/info:embedFieldServerUsageValue');
export const ButtonInvite = T('commands/info:buttonInvite');
export const ButtonSupport = T('commands/info:buttonSupport');
export const ButtonGitHub = T('commands/info:buttonGitHub');
export const ButtonDonate = T('commands/info:buttonDonate');
