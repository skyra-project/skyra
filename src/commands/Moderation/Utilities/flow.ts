import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { canReadMessages } from '@sapphire/discord.js-utilities';
import { send } from '@skyra/editable-commands';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Moderation.FlowDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.FlowExtended,
	permissionLevel: PermissionLevels.Moderator,
	runIn: ['GUILD_ANY']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = args.finished ? message.channel : await args.pick('textChannelName');
		if (!canReadMessages(channel)) this.error(LanguageKeys.Misc.ChannelNotReadable);

		const messages = await channel.messages.fetch({ limit: 100, before: message.id });
		const minimum = message.createdTimestamp - 60000;
		const amount = messages.reduce((prev, curr) => (curr.createdTimestamp > minimum ? prev + 1 : prev), 0);

		const content = args.t(LanguageKeys.Commands.Moderation.Flow, { amount });
		return send(message, content);
	}
}
