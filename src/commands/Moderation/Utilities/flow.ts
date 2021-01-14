import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { TextChannel } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 15,
	description: LanguageKeys.Commands.Moderation.FlowDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.FlowExtended,
	permissionLevel: PermissionLevels.Moderator,
	runIn: ['text'],
	usage: '[channel:textchannelname]'
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [channel = message.channel as TextChannel]: [TextChannel?]) {
		const t = await message.fetchT();

		if (!channel.readable) throw t(LanguageKeys.Misc.ChannelNotReadable);
		const messages = await channel.messages.fetch({ limit: 100, before: message.id });
		const minimum = message.createdTimestamp - 60000;
		const amount = messages.reduce((prev, curr) => (curr.createdTimestamp > minimum ? prev + 1 : prev), 0);

		return message.send(t(LanguageKeys.Commands.Moderation.Flow, { amount }));
	}
}
