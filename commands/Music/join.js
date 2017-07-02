const managerMusic = require("../../utils/managerMusic");

const { resNoVoiceChannel } = managerMusic.config;

exports.run = async (client, msg) => {
    const voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel) return msg.send(resNoVoiceChannel[Math.floor(resNoVoiceChannel.length * Math.random())]);

    const musicInterface = managerMusic.get(msg.guild.id);
    if (!musicInterface) {
        await managerMusic.create(msg.guild).join(voiceChannel);
    } else {
        await musicInterface.join(voiceChannel);
    }

    return msg.alert(`Successfully connected to ${voiceChannel}`);
};

exports.conf = {
    enabled: true,
    runIn: ["text"],
    aliases: ["connect"],
    permLevel: 0,
    botPerms: ["CONNECT"],
    requiredFuncs: [],
    spam: false,
    mode: 2,
    cooldown: 10,
    guilds: managerMusic.guilds,
};

exports.help = {
    name: "join",
    description: "Join a voice channel.",
    usage: "",
    usageDelim: "",
    extendedHelp: "",
};
