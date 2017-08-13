const { Inhibitor } = require('../index');

module.exports = class extends Inhibitor {

    async run(msg, cmd) {
        const { broke, permission } = await this.client.permissionLevels.run(msg, cmd.permLevel);
        if (permission) return;
        throw broke ? msg.language.get('INHIBITOR_PERMISSIONS') : true;
    }

};
