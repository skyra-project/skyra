const { MultiArgument } = require('../index');

module.exports = class extends MultiArgument {

	get base() {
		return this.store.get('username');
	}

};
