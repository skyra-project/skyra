import { kRawEmoji } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['ge', 'giveaway-end'],
	description: LanguageKeys.Commands.Giveaway.GiveawayEndDescription,
	extendedHelp: LanguageKeys.Commands.Giveaway.GiveawayEndExtended,
	permissionLevel: PermissionLevels.Moderator,
	permissions: ['READ_MESSAGE_HISTORY'],
	runIn: ['text', 'news']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textOrNewsChannelName').catch(() => message.channel);
		const target = await args.pick('message', { channel });
		if (!this.validateMessage(target)) this.error(LanguageKeys.Commands.Giveaway.GiveawayEndMessageNotMine);

		const entries = this.context.client.giveaways.queue;
		const entryIndex = entries.findIndex((entry) => entry.messageID === target.id);
		if (entryIndex === -1) this.error(LanguageKeys.Commands.Giveaway.GiveawayEndMessageNotActive);

		const [entry] = entries.splice(entryIndex, 1);
		entry.endsAt = new Date();
		await entry.render();
		await entry.remove();

		return message.send(args.t(LanguageKeys.Commands.Giveaway.GiveawayEnd, { url: target.url }));
	}

	/**
	 * Validates that this message is a message from Skyra and is a giveaway
	 */
	private validateMessage(message: Message) {
		return (
			message.author !== null &&
			message.author.id === process.env.CLIENT_ID &&
			message.embeds.length === 1 &&
			message.reactions.cache.has(kRawEmoji)
		);
	}
}
