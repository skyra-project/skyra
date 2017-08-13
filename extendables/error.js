const { Extendable, util } = require('../index');

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, ['Message']);
    }

    extend(content, log = false) {
        if (log) this.client.emit('log', content, 'error');
        return this.alert(`|\`❌\`| **ERROR**:\n${util.codeBlock('js', content)}`);
    }

};
