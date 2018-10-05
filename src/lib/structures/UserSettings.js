const { Settings } = require('klasa');

/**
 * The UserSettings class that manages per-user settings
 * @since 1.6.0
 * @version 6.0.0
 * @extends {Settings}
 */
class UserSettings extends Settings {

	get level() {
		// @ts-ignore
		return Math.floor(0.2 * Math.sqrt(this.points));
	}

	win(money, guild) {
		if (guild) money *= guild.settings.social.boost;
		return this.add(money);
	}

	add(money) {
		// @ts-ignore
		return this.update('money', this.money + money).then(() => this.money);
	}

	use(money) {
		// @ts-ignore
		if (this.money < money) {
			const error = new Error(`[FAILSAFE] ${this} | Cannot get a debt.`);
			this.client.emit('wtf', error);
			throw error;
		}
		// @ts-ignore
		return this.update('money', this.money - money).then(() => this.money);
	}

}

module.exports = UserSettings;
