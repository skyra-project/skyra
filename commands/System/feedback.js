const { Command } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            botPerms: ['EMBED_LINKS'],
            mode: 2,
            cooldown: 10,

            usage: '<message:string{8,1900}>',
            description: "Send a feedback message to the bot's owner."
        });

        this.channel = null;
    }

    async run(msg, [feedback]) {
        const embed = new MessageEmbed()
            .setColor(0x06d310)
            .setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL({ size: 128 }))
            .setDescription(feedback)
            .setFooter(`${msg.author.id} | Feedback`)
            .setTimestamp();

        if (msg.deletable) msg.delete().catch(() => null);

        await this.channel.send({ embed }).catch(Command.handleError);
        return msg.alert(`Dear ${msg.author}, thanks you for sending us feedback!`);
    }

    init() {
        this.channel = this.client.channels.get('257561807500214273');
    }

};
