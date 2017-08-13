const { Extendable } = require('../index');

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, ['GroupDMChannel', 'DMChannel', 'TextChannel'], { name: 'embedable' });
    }

    get extend() {
        if (!this.guild) return true;
        return this.postable && this.permissionsFor(this.guild.me).has('EMBED_LINKS');
    }

};
