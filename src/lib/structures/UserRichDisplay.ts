import { KlasaMessage, ReactionHandler, RichDisplay, RichDisplayRunOptions, util, KlasaUser } from 'klasa';
import { MessageReaction } from 'discord.js';
const FIVE_MINUTES = 60000 * 5;

export class UserRichDisplay extends RichDisplay {

	public async start(message: KlasaMessage, target: string = message.author.id, options: RichDisplayRunOptions = {}): Promise<ReactionHandler> {
		util.mergeDefault({
			filter: (_: MessageReaction, user: KlasaUser) => user.id === target,
			time: FIVE_MINUTES
		}, options);
		if (target) {
			// Stop the previous display and cache the new one
			const display = UserRichDisplay.handlers.get(target);
			if (display) display.stop();
		}

		const handler = (await super.run(message, options))
			.once('end', () => UserRichDisplay.handlers.delete(target));
		UserRichDisplay.handlers.set(target, handler);

		return handler;
	}

	public static readonly handlers: Map<string, ReactionHandler> = new Map();

}
