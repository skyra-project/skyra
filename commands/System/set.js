const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permLevel: 10,
            mode: 2,

            usage: '[online|idle|invisible|dnd] [game:string]',
            description: "Change bot's status or game."
        });
    }

    async run(msg, [status = null, ...game]) {
        if (status) {
            await this.client.user.setStatus(status).catch(Command.handleError);
            return msg.alert(`Status set to: *${status}*`);
        }
        if (game.length) {
            await this.client.user.setGame(game.join(' ')).catch(Command.handleError);
            return msg.alert(`Game set to: *${game.join(' ')}*`);
        }
        await this.client.user.setStatus('online').catch(Command.handleError);
        return msg.alert('Status set to: *online*');
    }

};
