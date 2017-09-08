const { Extendable, util } = require('../index');

const isException = (error) => error && error.constructor ? error.constructor.name.endsWith('Error') : false;

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, ['Message']);
    }

    extend(content, log = false) {
        if (!content) return null;
        if (log) this.client.emit('log', content, 'error');

        if (typeof error === 'string') return this.alert(`Dear ${this.author}, ${content}`);

        if (isException(content)) {
            this.client.emit('log', `ERROR: /${this.guild.id}/${this.channel.id}/${this.id}/ (${this.author.id}) | ${content.constructor.name}`, 'warn');
            this.client.emit('log', content, 'wtf');
            if (this.author.id === '242043489611808769') content = content.stack || content.message;
            else content = 'What a Terrible Failure! I am very sorry!';
        } else if (content.stack && this.author.id === '242043489611808769') content = content.stack;
        else content = content.message || content;

        return this.alert(`|\`❌\`| **ERROR**:\n${util.codeBlock('js', content)}`);
    }

};
