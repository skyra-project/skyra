const Command = require("../../classes/command");

/* eslint-disable class-methods-use-this */
module.exports = class Nickname extends Command {

    constructor(...args) {
        super(...args, "nickname", {
            aliases: ["nick"],
            guildOnly: true,
            permLevel: 3,
            botPerms: ["CHANGE_NICKNAME"],
            mode: 2,

            usage: "[nick:string{,32}]",
            description: "Change Skyra's nickname.",
        });
    }

    async run(msg, [nick = ""]) {
        await msg.guild.member(this.client.user).setNickname(nick).catch(Command.handleError);
        return msg.alert(nick.length ? `Nickname changed to **${nick}**` : "Nickname Cleared");
    }

};
