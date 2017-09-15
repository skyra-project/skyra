const { Extendable } = require('../index');

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, ['Message']);
    }

    extend(content, options) {
        if (!options && typeof content === 'object' && Array.isArray(content) === false) {
            options = content;
            content = '';
        } else if (!options) {
            options = {};
        }

        if (typeof options.embed === 'undefined') options.embed = null;
        const commandMessage = this.client.commandMessages.get(this.id);

        if (commandMessage && 'files' in options === false)
            return commandMessage.response.edit(content, options).catch((error) => {
                if (error.code !== 10008) throw error;
                this.client.commandMessages.delete(this.id);
                return this.send(content, options);
            });

        return this.channel.send(content, options).then((mes) => {
            if (mes.constructor.name === 'Message' && 'files' in options === false) this.client.commandMessages.set(this.id, { trigger: this, response: mes });
            return mes;
        });
    }

};
