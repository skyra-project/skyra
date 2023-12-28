import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { DiscordAPIError, PermissionFlagsBits, RESTJSONErrorCodes, type Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Tools.VoteDescription,
	detailedDescription: LanguageKeys.Commands.Tools.VoteExtended,
	requiredClientPermissions: [PermissionFlagsBits.AddReactions, PermissionFlagsBits.ReadMessageHistory],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: Message, args: SkyraCommand.Args) {
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
