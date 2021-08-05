import { kRawEmoji } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@skyra/editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['ge', 'giveaway-end'],
	description: LanguageKeys.Commands.Giveaway.GiveawayEndDescription,
	extendedHelp: LanguageKeys.Commands.Giveaway.GiveawayEndExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: ['READ_MESSAGE_HISTORY'],
	runIn: ['GUILD_ANY']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const channel = await args.pick('textOrNewsChannelName').catch(() => message.channel);
		const target = await args.pick('message', { channel });
		if (!this.validateMessage(target)) this.error(LanguageKeys.Commands.Giveaway.GiveawayEndMessageNotMine);

		const entries = this.container.client.giveaways.queue;
		const entryIndex = entries.findIndex((entry) => entry.messageId === target.id);
		if (entryIndex === -1) this.error(LanguageKeys.Commands.Giveaway.GiveawayEndMessageNotActive);

		const [entry] = entries.splice(entryIndex, 1);
		entry.endsAt = new Date();
		await entry.render();
		await entry.remove();

		const content = args.t(LanguageKeys.Commands.Giveaway.GiveawayEnd, { url: target.url });
		return send(message, content);
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
