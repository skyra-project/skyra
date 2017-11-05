const { structures: { Extendable } } = require('../index');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['GroupDMChannel', 'DMChannel', 'TextChannel'], { name: 'attachable' });
	}

	get extend() {
		if (!this.guild) return true;
		return this.postable && this.permissionsFor(this.guild.me).has('ATTACH_FILES');
	}

};
