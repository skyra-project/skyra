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
        await msg.guild.me.setNickname(nick).catch(Command.handleError);
        return msg.alert(nick.length > 0 ? `Nickname changed to **${nick}**` : 'Nickname Cleared');
    }

};
