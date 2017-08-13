const { Extendable } = require('../index');

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, ['GroupDMChannel', 'DMChannel', 'TextChannel'], { name: 'postable' });
    }

    get extend() {
        if (!this.guild) return true;
        return this.readable && this.permissionsFor(this.guild.me).has('SEND_MESSAGES');
    }

};
