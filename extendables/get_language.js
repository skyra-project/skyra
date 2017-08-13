const { Extendable } = require('../index');

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, ['Message', 'Guild'], { name: 'language' });
    }

    get extend() {
        return this.client.languages.get(this.constructor.name === 'Message' ? this.guildSettings.language : this.settings.language);
    }

};
