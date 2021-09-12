import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { RESTJSONErrorCodes } from 'discord-api-types/rest/v9';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord-api-types/payloads/v9';
import { RESTJSONErrorCodes } from 'discord-api-types/rest/v6';
import { DiscordAPIError, Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Tools.VoteDescription,
	extendedHelp: LanguageKeys.Commands.Tools.VoteExtended,
	requiredClientPermissions: [PermissionFlagsBits.AddReactions, PermissionFlagsBits.ReadMessageHistory],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		if (args.finished) this.error(LanguageKeys.Commands.Tools.VoteContentNeeded);

		for (const reaction of ['👍', '👎', '🤷']) {
			if (!message.reactions.cache.has(reaction)) await this.react(message, reaction);
		}

		return message;
	}

	private async react(message: Message, reaction: string) {
		try {
			await message.react(reaction);
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.ReactionWasBlocked) {
				this.error(LanguageKeys.Commands.Tools.VoteReactionBlocked);
			}
			throw error;
		}
	}
}
