const { Command } = require('../../index');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['nick'],
            guildOnly: true,
            permLevel: 3,
            botPerms: ['CHANGE_NICKNAME'],
            mode: 2,
            cooldown: 30,

            usage: '[nick:string{,32}]',
            description: "Change Skyra's nickname."
        });
    }

    async run(msg, [nick = '']) {
        await msg.guild.member(this.client.user).setNickname(nick).catch(Command.handleError);
        return msg.alert(nick.length ? `Nickname changed to **${nick}**` : 'Nickname Cleared');
    }

};
