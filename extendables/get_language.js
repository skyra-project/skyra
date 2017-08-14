const { Extendable } = require('../index');

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, ['Message', 'Guild'], { name: 'language' });
    }

    get extend() {
        return this.client.languages.get(this.constructor.name === 'Message' ? this.guildSettings.master.language : this.settings.master.language);
    }

};
