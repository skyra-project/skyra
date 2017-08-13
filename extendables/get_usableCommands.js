const { Extendable } = require('../index');

module.exports = class extends Extendable {

    constructor(...args) {
        super(...args, ['Message'], { name: 'usableCommands' });
    }

    async extend() {
        return this.client.commands.filter(async command => await !this.client.commandInhibitors.some(async inhibitor => {
            if (inhibitor.enabled && !inhibitor.spamProtection) return await inhibitor.run(this.client, this, command).catch(() => true);
            return false;
        }));
    }

};
