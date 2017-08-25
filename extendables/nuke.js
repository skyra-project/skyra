const { Extendable } = require('../index');

const exec = (msg) => {
    msg.action = 'DELETE';
    return msg.delete();
};

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, ['Message']);
    }

    extend(time = 0) {
        if (this.timer) {
            clearTimeout(this.timer);
            delete this.timer;
        }

        if (time === 0) return exec(this);

        const count = this.edits.length;
        this.timer = setTimeout(() => {
            const msg = this.channel.messages.get(this.id);
            if (msg && msg.edits.length === count) return exec(this);
            return null;
        }, time);

        return false;
    }

};
