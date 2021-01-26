import { GuildSettings, TriggerIncludes } from '#lib/database';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';

@ApplyOptions<EventOptions>({ event: Events.GuildUserMessage })
export class UserEvent extends Event {
	public async run(message: GuildMessage): Promise<void> {
		const triggers = await message.guild.readSettings(GuildSettings.Trigger.Includes);
		if (triggers.length <= 0) return;

		const content = message.content.toLowerCase();
		const trigger = triggers.find((trg) => content.includes(trg.input));
		if (trigger && trigger.action === 'react') {
			if (message.reactable) {
				await this.tryReact(message, trigger);
			}
		}
	}

	public shouldRun(message: GuildMessage) {
		return (
			this.enabled &&
			message.guild !== null &&
			message.author !== null &&
			message.editedTimestamp === 0 &&
			message.content.length > 0 &&
			!message.system &&
			!message.author.bot
		);
	}

	private async tryReact(message: GuildMessage, trigger: TriggerIncludes) {
		try {
			await message.react(trigger.output);
		} catch (error) {
			// Message has been deleted
			if (error.code === RESTJSONErrorCodes.UnknownMessage) return;
			// Attempted to react to a user who blocked the bot
			if (error.code === RESTJSONErrorCodes.ReactionWasBlocked) return;
			// The emoji has been deleted or the bot is not in the whitelist
			if (error.code === RESTJSONErrorCodes.UnknownEmoji) {
				await message.guild.writeSettings((settings) => {
					const triggerIndex = settings[GuildSettings.Trigger.Includes].findIndex((element) => element === trigger);
					settings[GuildSettings.Trigger.Includes].splice(triggerIndex, 1);
				});
			} else {
				this.context.client.emit(Events.ApiError, error);
			}
		}
	}
}
