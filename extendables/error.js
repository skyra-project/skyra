const { Extendable, util } = require('../index');

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, ['Message']);
    }

    extend(content, log = false) {
        if (!content) return null;
        if (log) this.client.emit('log', content, 'error');

        if (typeof error === 'string') return this.alert(`Dear ${this.author}, ${content}`);
        if (content.stack && this.client.debugMode && this.author.id === '242043489611808769') content = content.stack;
        else content = content.message || content;

        return this.alert(`|\`❌\`| **ERROR**:\n${util.codeBlock('js', content)}`);
    }

};
