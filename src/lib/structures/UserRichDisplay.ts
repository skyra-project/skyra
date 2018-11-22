import { KlasaMessage, ReactionHandler, RichDisplay, RichDisplayRunOptions, util } from 'klasa';
const FIVE_MINUTES = 60000 * 5;

export class UserRichDisplay extends RichDisplay {

	// @ts-ignore
	public async run(message: KlasaMessage, target: string = message.author.id, options: RichDisplayRunOptions = {}): Promise<ReactionHandler> {
		util.mergeDefault({
			filter: (_, user) => user.id === target,
			time: FIVE_MINUTES
		}, options);
		if (target) {
			// Stop the previous display and cache the new one
			const display = handlers.get(target);
			if (display) display.stop();
		}

		const handler = (await super.run(message, options))
			.once('end', () => handlers.delete(target));
		handlers.set(target, handler);

		return handler;
	}

}

/**
 * The cached handlers
 */
export const handlers: Map<string, ReactionHandler> = new Map();
