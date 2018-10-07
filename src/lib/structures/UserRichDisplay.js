const { RichDisplay } = require('klasa');
const FIVE_MINUTES = 60000 * 5;

class UserRichDisplay extends RichDisplay {

	async run(message, target = message.author.id, { filter = (reaction, user) => user.id === target, time = FIVE_MINUTES, ...options } = {}) {
		if (target) {
			// Stop the previous display and cache the new one
			const display = UserRichDisplay.handlers.get(target);
			if (display) display.stop();
		}

		const handler = (await super.run(message, { ...options, filter, time }))
			.once('end', () => UserRichDisplay.handlers.delete(target));
		UserRichDisplay.handlers.set(target, handler);

		return handler;
	}

}

/**
 * The cached handlers
 * @since 4.0.0
 * @type {Map<string, SKYRA.ReactionHandler>}
 */
UserRichDisplay.handlers = new Map();

module.exports = UserRichDisplay;
