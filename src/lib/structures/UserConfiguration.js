const { Configuration } = require('klasa');

/**
 * The UserConfiguration class that manages per-user configs
 * @since 1.6.0
 * @version 6.0.0
 * @extends {Configuration}
 */
class UserConfiguration extends Configuration {

	get level() {
		return Math.floor(0.2 * Math.sqrt(this.points));
	}

	win(money, guild) {
		if (guild) money *= guild.configs.social.boost;
		return this.add(money);
	}

	add(money) {
		this.money += money;
		return this.update('money', this.money).then(() => this.money);
	}

	use(money) {
		if (this.money < money) {
			const error = new Error(`[FAILSAFE] ${this} | Cannot get a debt.`);
			this.client.emit('wtf', error);
			throw error;
		}
		return this.update('money', this.money - money).then(() => this.money);
	}

}

module.exports = UserConfiguration;
