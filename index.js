const { Collection, MessageEmbed, MessageCollector } = require('discord.js');

module.exports = {
    ArgResolver: require('./classes/argResolver'),
    Client: require('./classes/client'),
    Command: require('./classes/command'),
    CommandMessage: require('./classes/commandMessage'),
    Loader: require('./classes/loader'),
    ParsedUsage: require('./classes/parsedUsage'),
    PermLevels: require('./classes/permLevels'),
    Resolver: require('./classes/Resolver'),
    SettingResolver: require('./classes/settingResolver'),
    Constants: require('./utils/constants'),
    Discord: {
        Collection,
        Embed: MessageEmbed,
        MessageCollector
    },
    Managers: {
        SocialGlobal: require('./utils/managers/socialGlobal'),
        SocialLocal: require('./utils/managers/socialLocal'),
        Guild: require('./utils/managers/guilds')
    },
    Handler: require('./utils/handler')
};
