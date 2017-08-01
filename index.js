const { Collection, MessageEmbed, MessageCollector, escapeMarkdown, splitMessage } = require('discord.js');

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
        MessageCollector,
        escapeMarkdown,
        splitMessage
    },
    Managers: {
        SocialGlobal: require('./utils/managerSocialGlobal'),
        SocialLocal: require('./utils/managerSocialLocal'),
        Guild: require('./utils/guildManager'),
        Music: require('./utils/managerMusic')
    }
};
