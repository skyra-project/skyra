import { GuildSettings, readSettings, TriggerIncludes, writeSettings } from '#lib/database';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { getEmojiReactionFormat } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { canReact } from '@sapphire/discord.js-utilities';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord-api-types/v9';
import type { DiscordAPIError } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildUserMessage })
export class UserListener extends Listener {
	public async run(message: GuildMessage): Promise<void> {
		// Triggers should not run on edits:
		if (message.editedTimestamp) return;

		const triggers = await readSettings(message.guild, GuildSettings.Trigger.Includes);
		if (triggers.length <= 0) return;

		const content = message.content.toLowerCase();
		const entry = triggers.find((trigger) => content.includes(trigger.input));
		if (entry && entry.action === 'react') {
			if (canReact(message.channel)) {
				await this.tryReact(message, entry);
			}
		}
	}

	private async tryReact(message: GuildMessage, trigger: TriggerIncludes) {
		try {
			await message.react(getEmojiReactionFormat(trigger.output));
		} catch (error) {
			// Message has been deleted
			if ((error as DiscordAPIError).code === RESTJSONErrorCodes.UnknownMessage) return;
			// Attempted to react to a user who blocked the bot
			if ((error as DiscordAPIError).code === RESTJSONErrorCodes.ReactionWasBlocked) return;
			// The emoji has been deleted or the bot is not in the list of allowed bots
			if ((error as DiscordAPIError).code === RESTJSONErrorCodes.UnknownEmoji) {
				await writeSettings(message.guild, (settings) => {
					const triggerIndex = settings[GuildSettings.Trigger.Includes].findIndex((element) => element === trigger);
					settings[GuildSettings.Trigger.Includes].splice(triggerIndex, 1);
				});
			} else {
				this.container.client.emit(Events.Error, error);
			}
		}
	}
}
