require('util').inspect.defaultOptions.depth = 1;

// Canvas setup
import { join } from 'path';
require('canvas-constructor').Canvas
    .registerFont(join(assetsFolder, 'fonts', 'Roboto-Regular.ttf'), 'RobotoRegular')
    .registerFont(join(assetsFolder, 'fonts', 'NotoEmoji.ttf'), 'RobotoRegular')
    .registerFont(join(assetsFolder, 'fonts', 'NotoSans-Regular.ttf'), 'RobotoRegular')
    .registerFont(join(assetsFolder, 'fonts', 'Roboto-Light.ttf'), 'RobotoLight')
    .registerFont(join(assetsFolder, 'fonts', 'Family-Friends.ttf'), 'FamilyFriends');

Skyra.defaultUserSchema
    .add('badgeList', 'String', { array: true, configurable: false })
    .add('badgeSet', 'String', { array: true, configurable: false })
    .add('bannerList', 'String', { array: true, configurable: false })
    .add('color', 'String', { configurable: false })
    .add('marry', 'User', { configurable: false })
    .add('money', 'Float', { default: 0, min: 0, max: 2147483647, configurable: false })
    .add('points', 'Float', { default: 0, min: 0, max: 2147483647, configurable: false })
    .add('reputation', 'Integer', { default: 0, min: 0, max: 32767, configurable: false })
    .add('themeLevel', 'String', { default: '1001', configurable: false })
    .add('themeProfile', 'String', { default: '0001', configurable: false })
    .add('timeDaily', 'Integer', { default: 0, configurable: false })
    .add('timeReputation', 'Integer', { default: 0, configurable: false });

Skyra.defaultGuildSchema
    .add('prefix', 'string', { filter: (value) => value.length >= 1 && value.length <= 10 })
    .add('tags', 'any', { array: true, configurable: false })
    .add('channels', folder => folder
        .add('announcement', 'TextChannel')
        .add('default', 'TextChannel')
        .add('log', 'TextChannel')
        .add('messagelogs', 'TextChannel')
        .add('modlog', 'TextChannel')
        .add('nsfwmessagelogs', 'TextChannel')
        .add('roles', 'TextChannel')
        .add('spam', 'TextChannel'))
    .add('disabledChannels', 'TextChannel', { array: true })
    .add('disabledCommandsChannels', 'any', { default: {}, configurable: false })
    .add('events', folder => folder
        .add('banAdd', 'Boolean', { default: false })
        .add('banRemove', 'Boolean', { default: false })
        .add('memberAdd', 'Boolean', { default: false })
        .add('memberRemove', 'Boolean', { default: false })
        .add('messageDelete', 'Boolean', { default: false })
        .add('messageEdit', 'Boolean', { default: false }))
    .add('filter', folder => folder
        .add('level', 'Integer', { default: 0, min: 0, max: 7, configurable: false })
        .add('raw', 'String', { array: true, configurable: false }))
    .add('messages', folder => folder
        .add('farewell', 'String', { max: 2000 })
        .add('greeting', 'String', { max: 2000 })
        .add('join-dm', 'String', { max: 1500 })
        .add('warnings', 'Boolean', { default: false }))
    .add('stickyRoles', 'any', { array: true })
    .add('roles', folder => folder
        .add('admin', 'Role')
        .add('auto', 'any', { array: true })
        .add('initial', 'Role')
        .add('messageReaction', 'String', { min: 17, max: 18, configurable: false })
        .add('moderator', 'Role')
        .add('muted', 'Role')
        .add('public', 'Role', { array: true })
        .add('reactions', 'any', { array: true })
        .add('removeInitial', 'Boolean')
        .add('staff', 'Role')
        .add('subscriber', 'Role'))
    .add('selfmod', folder => folder
        .add('attachment', 'Boolean', { default: false })
        .add('attachmentMaximum', 'Integer', { default: 20, min: 0, max: 60 })
        .add('attachmentDuration', 'Integer', { default: 20000, min: 5000, max: 120000, configurable: false })
        .add('attachmentAction', 'Integer', { default: 0, configurable: false })
        .add('attachmentPunishmentDuration', 'Integer', { configurable: false })
        .add('capsfilter', 'Integer', { default: 0, min: 0, max: 7, configurable: false })
        .add('capsminimum', 'Integer', { default: 10, min: 0, max: 2000 })
        .add('capsthreshold', 'Integer', { default: 50, min: 0, max: 100 })
        .add('ignoreChannels', 'TextChannel', { array: true })
        .add('invitelinks', 'Boolean', { default: false })
        .add('nmsthreshold', 'Integer', { default: 20, min: 10, max: 100 })
        .add('nomentionspam', 'Boolean')
        .add('raid', 'Boolean')
        .add('raidthreshold', 'Integer', { default: 10, min: 2, max: 50 }))
    .add('social', folder => folder
        .add('achieve', 'Boolean', { default: false })
        .add('achieveMessage', 'String')
        .add('boost', 'Float', { default: 1, configurable: false })
        .add('ignoreChannels', 'TextChannel', { array: true })
        .add('monitorBoost', 'Float', { default: 1, configurable: false }))
    .add('starboard', folder => folder
        .add('channel', 'TextChannel')
        .add('emoji', 'String', { default: '%E2%AD%90', configurable: false })
        .add('ignoreChannels', 'TextChannel', { array: true })
        .add('minimum', 'Integer', { default: 1, min: 1, max: 20 }))
    .add('trigger', folder => folder
        .add('alias', 'any', { array: true, configurable: false })
        .add('includes', 'any', { array: true, configurable: false }));

// eslint-disable-next-line no-process-env
const DEV = 'DEV' in process.env ? process.env.DEV === 'true' : !('PM2_HOME' in process.env);

// Skyra setup
Skyra.defaultPermissionLevels
    .add(4, (client, msg) => msg.member ? msg.guild.settings.roles.staff
        ? msg.member.roles.has(msg.guild.settings.roles.staff)
        : msg.member.permissions.has(FLAGS.MANAGE_MESSAGES) : false, { fetch: true })
    .add(5, (client, msg) => msg.member ? msg.guild.settings.roles.moderator
        ? msg.member.roles.has(msg.guild.settings.roles.moderator)
        : msg.member.permissions.has(FLAGS.BAN_MEMBERS) : false, { fetch: true })
    .add(6, (client, msg) => msg.member ? msg.guild.settings.roles.admin
        ? msg.member.roles.has(msg.guild.settings.roles.admin)
        : msg.member.permissions.has(FLAGS.MANAGE_GUILD) : false, { fetch: true });

const skyra = new Skyra({
    commandEditing: true,
    commandLogging: false,
    console: config.console,
    consoleEvents: { verbose: true },
    dev: DEV,
    disabledEvents: [
        'CHANNEL_PINS_UPDATE',
        'GUILD_MEMBER_UPDATE',
        'PRESENCE_UPDATE',
        'TYPING_START',
        'USER_UPDATE',
        'VOICE_SERVER_UPDATE'
    ],
    messageCacheLifetime: 300,
    messageCacheMaxSize: 50,
    messageSweepInterval: 120,
    pieceDefaults: {
        commands: { deletable: true, promptLimit: 5, promptTime: 60000, quotedStringSupport: true },
        ipcMonitors: { enabled: true },
        monitors: { ignoreOthers: false },
        rawEvents: { enabled: true }
    },
    prefix: DEV ? 'sd!' : 's!',
    presence: { activity: { name: DEV ? 'sd!help' : 'Skyra, help', type: 'LISTENING' } },
    providers: {
        default: 'rethinkdb',
        rethinkdb: DEV ? config.database.rethinkdb.development : config.database.rethinkdb.production
    },
    readyMessage: (client) =>
        `Skyra ${config.version} ready! [${client.user.tag}] [ ${client.guilds.size} [G]] [ ${client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} [U]].`,
    regexPrefix: DEV ? null : /^(hey )?(eva|skyra)(,|!)/i,
    restTimeOffset: 0,
    schedule: { interval: 5000 },
    slowmode: 750,
    slowmodeAggressive: true,
    typing: false
});

skyra.login(DEV ? config.tokens.BOT.DEV : config.tokens.BOT.STABLE)
    .catch((error) => skyra.console.wtf(`Login Error:\n${(error && error.stack) || error}`));
