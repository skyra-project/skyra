const { Extendable } = require('../index');

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, ['Message']);
    }

    extend(content, options) {
        if (!options && typeof content === 'object' && !(content instanceof Array)) {
            options = content;
            content = '';
        } else if (!options) {
            options = {};
        }

        const commandMessage = this.client.commandMessages.get(this.id);
        if (commandMessage && 'files' in options === false) return commandMessage.response.edit(content, options);
        return this.channel.send(content, options)
            .then((mes) => {
                if (mes.constructor.name === 'Message' && 'files' in options === false) this.client.commandMessages.set(this.id, { trigger: this, response: mes });
                return mes;
            });
    }

};
