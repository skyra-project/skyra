const { Configuration } = require('klasa');

module.exports = class UserConfiguration extends Configuration {

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
		this.money -= money;
		return this.update('money', this.money).then(() => this.money);
	}

};
