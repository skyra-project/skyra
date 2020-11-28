import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { GuildMessage } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { TextChannel } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 15,
	description: (language) => language.get(LanguageKeys.Commands.Moderation.FlowDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.FlowExtended),
	permissionLevel: PermissionLevels.Moderator,
	runIn: ['text'],
	usage: '[channel:textchannelname]'
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [channel = message.channel as TextChannel]: [TextChannel?]) {
		if (!channel.readable) throw await message.fetchLocale(LanguageKeys.Misc.ChannelNotReadable);
		const messages = await channel.messages.fetch({ limit: 100, before: message.id });
		const minimum = message.createdTimestamp - 60000;
		const amount = messages.reduce((prev, curr) => (curr.createdTimestamp > minimum ? prev + 1 : prev), 0);

		return message.sendLocale(LanguageKeys.Commands.Moderation.Flow, [{ amount }]);
	}
}
