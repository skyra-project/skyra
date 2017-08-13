module.exports = {
    Client: require('./lib/client'),
    util: require('./lib/util/util'),

    Command: require('./lib/structures/Command'),
    CommandMessage: require('./lib/structures/CommandMessage'),
    Event: require('./lib/structures/Event'),
    Extendable: require('./lib/structures/Extendable'),
    Finalizer: require('./lib/structures/Finalizer'),
    Inhibitor: require('./lib/structures/Inhibitor'),
    Language: require('./lib/structures/Language'),
    Monitor: require('./lib/structures/Monitor'),
    PermissionLevels: require('./lib/structures/PermissionLevels'),

    CommandStore: require('./lib/structures/CommandStore'),
    EventStore: require('./lib/structures/EventStore'),
    ExtendableStore: require('./lib/structures/ExtendableStore'),
    FinalizerStore: require('./lib/structures/FinalizerStore'),
    InhibitorStore: require('./lib/structures/InhibitorStore'),
    LanguageStore: require('./lib/structures/LanguageStore'),
    MonitorStore: require('./lib/structures/MonitorStore'),

    Piece: require('./lib/structures/interfaces/Piece'),
    Store: require('./lib/structures/interfaces/Store'),

    ArgResolver: require('./lib/parsers/ArgResolver'),
    Resolver: require('./lib/parsers/Resolver'),
    SettingResolver: require('./lib/parsers/SettingResolver'),
    ParsedUsage: require('./lib/usage/ParsedUsage'),
    Possible: require('./lib/usage/Possible'),
    Tag: require('./lib/usage/Tag'),
    version: '2.0.0 LNU',

    Constants: require('./utils/constants'),
    Managers: {
        SocialGlobal: require('./utils/managers/socialGlobal'),
        SocialLocal: require('./utils/managers/socialLocal'),
        Guild: require('./utils/managers/guilds')
    },
    Handler: require('./utils/handler'),
    Crypto: require('./utils/crypto'),
    Timer: require('./utils/timer'),
    SkyraError: require('./functions/SkyraError'),

    config: require('./config')
};
