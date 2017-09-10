const { Language, util } = require('../index');
const Duration = require('../utils/duration');

const TIMES = {
    DAY: {
        PLURAL: 'days',
        SING: 'day',
        SHORT_PLURAL: 'ds',
        SHORT_SING: 'd'
    },
    HOUR: {
        PLURAL: 'hours',
        SING: 'hour',
        SHORT_PLURAL: 'hrs',
        SHORT_SING: 'hr'
    },
    MINUTE: {
        PLURAL: 'minutes',
        SING: 'minute',
        SHORT_PLURAL: 'mins',
        SHORT_SING: 'min'
    },
    SECOND: {
        PLURAL: 'seconds',
        SING: 'second',
        SHORT_PLURAL: 'secs',
        SHORT_SING: 'sec'
    }
};

const PERMS = {
    // General
    ADMINISTRATOR: 'Administrator',
    VIEW_AUDIT_LOG: 'View Audit Log',
    MANAGE_GUILD: 'Manage Server',
    MANAGE_ROLES: 'Manage Roles',
    MANAGE_CHANNELS: 'Manage Channels',
    KICK_MEMBERS: 'Kick Members',
    BAN_MEMBERS: 'Ban Members',
    CREATE_INSTANT_INVITE: 'Create Instant Invite',
    CHANGE_NICKNAME: 'Change Nickname',
    MANAGE_NICKNAMES: 'Manage Nicknames',
    MANAGE_EMOJIS: 'Manage Emojis',
    MANAGE_WEBHOOKS: 'Manage Webhooks',
    VIEW_CHANNEL: 'Read Messages',
    SEND_MESSAGES: 'Send Messages',
    SEND_TTS_MESSAGES: 'Send TTS Messages',
    MANAGE_MESSAGES: 'Manage Messages',
    EMBED_LINKS: 'Embed Links',
    ATTACH_FILES: 'Attach Files',
    READ_MESSAGE_HISTORY: 'Read Message History',
    MENTION_EVERYONE: 'Mention Everyone',
    USE_EXTERNAL_EMOJIS: 'Use External Emojis',
    ADD_REACTIONS: 'Add Reactions',
    CONNECT: 'Connect',
    SPEAK: 'Speak',
    MUTE_MEMBERS: 'Mute Members',
    DEAFEN_MEMBERS: 'Deafen Members',
    MOVE_MEMBERS: 'Move Members',
    USE_VAD: 'Use Voice Activity'
};

const duration = (time, short) => Duration.duration(time, TIMES, short);

module.exports = class extends Language {

    constructor(...args) {
        super(...args);
        this.PERMISSIONS = PERMS;
        this.language = {
            DEFAULT: (key) => `${key} has not been localized for en-US yet.`,
            DEFAULT_LANGUAGE: 'Default Language',
            SETTING_GATEWAY_EXPECTS_GUILD: 'The parameter <Guild> expects either a Guild or a Guild Object.',
            SETTING_GATEWAY_VALUE_FOR_KEY_NOEXT: (data, key) => `The value ${data} for the key ${key} does not exist.`,
            SETTING_GATEWAY_VALUE_FOR_KEY_ALREXT: (data, key) => `The value ${data} for the key ${key} already exists.`,
            SETTING_GATEWAY_SPECIFY_VALUE: 'You must specify the value to add or filter.',
            SETTING_GATEWAY_KEY_NOT_ARRAY: (key) => `The key ${key} is not an Array.`,
            SETTING_GATEWAY_KEY_NOEXT: (key) => `The key ${key} does not exist in the current data schema.`,
            SETTING_GATEWAY_INVALID_TYPE: 'The type parameter must be either add or remove.',

            RESOLVER_INVALID_PIECE: (name, piece) => `${name} must be a valid ${piece} name.`,
            RESOLVER_INVALID_MSG: (name) => `${name} must be a valid message id.`,
            RESOLVER_INVALID_USER: (name) => `${name} must be a mention or valid user id.`,
            RESOLVER_INVALID_MEMBER: (name) => `${name} must be a mention or valid user id.`,
            RESOLVER_INVALID_CHANNEL: (name) => `${name} must be a channel tag or valid channel id.`,
            RESOLVER_INVALID_GUILD: (name) => `${name} must be a valid guild id.`,
            RESOLVER_INVALID_ROLE: (name) => `${name} must be a role mention or role id.`,
            RESOLVER_INVALID_LITERAL: (name) => `Your option did not match the only possibility: ${name}`,
            RESOLVER_INVALID_BOOL: (name) => `${name} must be true or false.`,
            RESOLVER_INVALID_INT: (name) => `${name} must be an integer.`,
            RESOLVER_INVALID_FLOAT: (name) => `${name} must be a valid number.`,
            RESOLVER_INVALID_URL: (name) => `${name} must be a valid url.`,
            RESOLVER_STRING_SUFFIX: ' characters',
            RESOLVER_MINMAX_EXACTLY: (name, min, suffix) => `${name} must be exactly ${min}${suffix}.`,
            RESOLVER_MINMAX_BOTH: (name, min, max, suffix) => `${name} must be between ${min} and ${max}${suffix}.`,
            RESOLVER_MINMAX_MIN: (name, min, suffix) => `${name} must be greater than ${min}${suffix}.`,
            RESOLVER_MINMAX_MAX: (name, max, suffix) => `${name} must be less than ${max}${suffix}.`,
            RESOLVER_POSITIVE_AMOUNT: 'A positive non-zero number is required for this argument.',

            COMMANDMESSAGE_MISSING: 'Missing one or more required arguments after end of input.',
            COMMANDMESSAGE_MISSING_REQUIRED: (name) => `${name} is a required argument.`,
            COMMANDMESSAGE_MISSING_OPTIONALS: (possibles) => `Missing a required option: (${possibles})`,
            COMMANDMESSAGE_NOMATCH: (possibles) => `Your option didn't match any of the possibilities: (${possibles})`,

            CONST_MONITOR_INVITELINK: 'Invite link',
            CONST_MONITOR_NMS: '[NOMENTIONSPAM]',
            CONST_MONITOR_WORDFILTER: 'Filtered Word',

            MONITOR_NOINVITE: user => `|\`❌\`| Dear ${user}, invite links aren't allowed here.`,
            MONITOR_WORDFILTER: user => `|\`❌\`| Pardon, dear ${user}, you said something that is not allowed in this server.`,
            MONITOR_NMS_MESSAGE: user => [
                `The banhammer has landed and now the user ${user.tag} with id ${user.id} is banned for mention spam.`,
                "Do not worry! I'm here to help you! 😄"
            ].join('\n'),
            MONITOR_NMS_MODLOG: (threshold, amount) => `[NOMENTIONSPAM] Threshold: ${threshold}. Reached: ${amount}`,
            MONITOR_COMMAND_HANDLER_REPROMPT: (tag, error) => `${tag} | **${error}** | You have **30** seconds to respond to this prompt with a valid argument. Type **"ABORT"** to abort this prompt.`,
            MONITOR_COMMAND_HANDLER_ABORTED: 'Aborted',
            MONITOR_SOCIAL_ACHIEVEMENT: 'Congratulations dear %MEMBER%, you achieved the role %ROLE%',

            INHIBITOR_COOLDOWN: (remaining) => `You have just used this command. You can use this command again in ${remaining} seconds.`,
            INHIBITOR_GUILDONLY: 'This command is designed to run only in servers.',
            INHIBITOR_DISABLED: 'This command is currently disabled',
            INHIBITOR_MISSING_BOT_PERMS: (missing) => `Insufficient permissions, missing: **${missing.map(perm => PERMS[perm] || perm)}**`,
            INHIBITOR_PERMISSIONS: 'You do not have permission to use this command',
            INHIBITOR_REQUIRED_SETTINGS: (settings) => `The guild is missing the **${settings.join(', ')}** guild setting${settings.length > 1 ? 's' : ''} and cannot run.`,
            INHIBITOR_SPAM: channel => `Can we move to ${channel} please? This command might be too spammy and can ruin other people's conversations.`,

            COMMAD_UNLOAD: (type, name) => `✅ Unloaded ${type}: ${name}`,
            COMMAND_TRANSFER_ERROR: '❌ That file has been transfered already or never existed.',
            COMMAND_TRANSFER_SUCCESS: (type, name) => `✅ Successfully transferred ${type}: ${name}`,
            COMMAND_TRANSFER_FAILED: (type, name) => `Transfer of ${type}: ${name} to Client has failed. Please check your Console.`,
            COMMAND_RELOAD: (type, name) => `✅ Reloaded ${type}: ${name}`,
            COMMAND_RELOAD_ALL: (type) => `✅ Reloaded all ${type}.`,
            COMMAND_REBOOT: 'Rebooting...',
            COMMAND_PING: 'Ping?',
            COMMAND_PINGPONG: (diff, ping) => `Pong! (Roundtrip took: ${diff}ms. Heartbeat: ${ping}ms.)`,
            COMMAND_INVITE_SELFBOT: 'Why would you need an invite link for a selfbot...',
            COMMAND_INVITE: (client) => [
                `To add Skyra to your discord guild: <${client.invite}>`,
                'Don\'t be afraid to uncheck some permissions, Skyra will let you know if you\'re trying to run a command without permissions.'
            ],
            COMMAND_HELP_DM: '📥 | Commands have been sent to your DMs.',
            COMMAND_HELP_NODM: '❌ | You have DMs disabled, I couldn\'t send you the commands in DMs.',
            COMMAND_ENABLE: (type, name) => `+ Successfully enabled ${type}: ${name}`,
            COMMAND_DISABLE: (type, name) => `+ Successfully disabled ${type}: ${name}`,
            COMMAND_DISABLE_WARN: 'You probably don\'t want to disable that, since you wouldn\'t be able to run any command to enable it again',
            COMMAND_CONF_NOKEY: 'You must provide a key',
            COMMAND_CONF_NOVALUE: 'You must provide a value',
            COMMAND_CONF_ADDED: (value, key) => `Successfully added the value \`${value}\` to the key: **${key}**`,
            COMMAND_CONF_UPDATED: (key, response) => `Successfully updated the key **${key}**: \`${response}\``,
            COMMAND_CONF_KEY_NOT_ARRAY: 'This key is not array type. Use the action \'reset\' instead.',
            COMMAND_CONF_REMOVE: (value, key) => `Successfully removed the value \`${value}\` from the key: **${key}**`,
            COMMAND_CONF_GET_NOEXT: (key) => `The key **${key}** does not seem to exist.`,
            COMMAND_CONF_GET: (key, value) => `The value for the key **${key}** is: \`${value}\``,
            COMMAND_CONF_RESET: (key, response) => `The key **${key}** has been reset to: \`${response}\``,

            // Commands#anime
            COMMAND_ANIME_DESCRIPTION: (entry, context) => [
                `**English title:** ${entry.english}`,
                `${context.length > 750 ? `${util.splitText(context, 750)}... [continue reading](https://myanimelist.net/anime/${entry.id})` : context}`
            ],
            COMMAND_ANIME_TITLE: (entry) => `${entry.title} (${entry.episodes === 0 ? 'unknown' : entry.episodes} episodes)`,
            COMMAND_ANIME_STATUS: (entry) => [
                `  ❯  Current status: **${entry.status}**`,
                `    • Started: **${entry.start_date}**\n${entry.end_date === '0000-00-00' ? '' : `    • Finished: **${entry.end_date}**`}`
            ],
            COMMAND_MANGA_DESCRIPTION: (entry, context) => [
                `**English title:** ${entry.english}`,
                `${context.length > 750 ? `${util.splitText(context, 750)}... [continue reading](https://myanimelist.net/anime/${entry.id})` : context}`
            ],
            COMMAND_MANGA_TITLE: (entry) => `${entry.title} (${entry.chapters ? 'unknown' : entry.chapters} chapters and ${entry.volumes ? 'unknown' : entry.volumes} volumes)`,
            COMMAND_MANGA_STATUS: (entry) => [
                `  ❯  Current status: **${entry.status}**`,
                `    • Started: **${entry.start_date}**\n${entry.end_date === '0000-00-00' ? '' : `    • Finished: **${entry.end_date}**`}`
            ],
            COMMAND_ANIME_TITLES: ['Type', 'Score', 'Status', 'Watch it here:'],

            // Commands#fun
            COMMAND_CATFACT: 'Cat Fact',
            COMMAND_DICE: (sides, rolls, result) => `you rolled the **${sides}**-dice **${rolls}** times, you got: **${result}**`,
            COMMAND_NORRIS: 'Chuck Norris',
            COMMAND_RATE: (user, rate, emoji) => `I would give **${user}** a **${rate}**/100 ${emoji}`,
            COMMAND_RATE_MYSELF: ['I love myself a lot 😊', 'myself'],
            COMMAND_RNG: (user, word) => `🕺 *Eeny, meeny, miny, moe, catch a tiger by the toe...* ${user}, I choose:${util.codeBlock('', word)}`,
            COMMAND_RNG_MISSING: 'Please write at least two options separated by comma.',
            COMMAND_RNG_DUP: (words) => `Why would I accept duplicated words? '${words}'.`,
            COMMAND_XKCD_COMICS: (amount) => `There are only ${amount} comics.`,
            // Commands#misc
            COMMAND_UNICODE: (string) => `There is your converted message:\n${string}`,

            // Commands#moderation
            // ## Utilities
            COMMAND_RAID_DISABLED: 'The Anti-RAID system is not enabled in this server.',
            COMMAND_RAID_MISSING_KICK: 'As I do not have the KICK MEMBERS permission, I keep the Anti-RAID unactivated.',
            COMMAND_RAID_LIST: 'List of users in the RAID queue',
            COMMAND_RAID_CLEAR: 'Successfully cleared the RAID list.',
            COMMAND_RAID_COOL: 'Successfully deactivated the RAID.',
            COMMAND_TIME_TIMED: 'The selected moderation case has already been timed.',
            COMMAND_TIME_UNDEFINED_TIME: 'You must specify a time.',
            COMMAND_TIME_UNSUPPORTED_TIPE: 'The type of action for the selected case cannot be reverse, therefore this action is unsupported.',
            COMMAND_TIME_NOT_SCHEDULED: 'This task is not scheduled.',
            COMMAND_TIME_ABORTED: (title) => `Successfully aborted the schedule for ${title}`,
            COMMAND_TIME_SCHEDULED: (title, user, time) => `✅ Successfully scheduled a moderation action type **${title}** for the user ${user.tag} (${user.id}) with a duration of ${duration(time)}`,

            // ## General

            COMMAND_BAN_NOT_BANNABLE: 'The target is not bannable for me.',
            COMMAND_BAN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **BANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
            COMMAND_SOFTBAN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **SOFTBANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
            COMMAND_UNBAN_MESSAGE: (user, reason, banReason, log) => `|\`🔨\`| [Case::${log}] **UNBANNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}${banReason ? `\nReason for Ban:${banReason}` : ''}`,
            COMMAND_UNBAN_MISSING_PERMISSION: `I will need the ${PERMS.BAN_MEMBERS} permission to be able to unban.`,
            COMMAND_KICK_NOT_KICKABLE: 'The target is not kickable for me.',
            COMMAND_KICK_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **KICKED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
            COMMAND_MUTE_MUTED: 'The target user is already muted.',
            COMMAND_MUTE_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **MUTED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
            COMMAND_MUTE_USER_NOT_MUTED: 'This user is not muted.',
            COMMAND_VMUTE_MISSING_PERMISSION: `I will need the ${PERMS.MUTE_MEMBERS} permission to be able to voice unmute.`,
            COMMAND_VMUTE_USER_NOT_MUTED: 'This user is not voice muted.',
            COMMAND_UNMUTE_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **UNMUTED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,
            COMMAND_UNMUTE_MISSING_PERMISSION: `I will need the ${PERMS.MANAGE_ROLES} permission to be able to unmute.`,
            COMMAND_WARN_MESSAGE: (user, reason, log) => `|\`🔨\`| [Case::${log}] **WARNED**: ${user.tag} (${user.id})${reason ? `\nReason: ${reason}` : ''}`,

            COMMAND_PRUNE: (amount, total) => `Successfully deleted ${amount} messages from ${total}.`,

            COMMAND_REASON_NOT_EXISTS: 'The selected modlog does not seem to exist.',

            COMMAND_MUTE_CONFIGURE: 'Do you want me to create and configure the Mute role now?',
            COMMAND_MUTE_CONFIGURE_CANCELLED: 'Prompt aborted, the Mute role creation has been cancelled.',

            COMMAND_FILTER_UNDEFINED_WORD: 'You must write what do you want me to filter.',
            COMMAND_FILTER_FILTERED: (filtered) => `This word is ${filtered ? 'already' : 'not'} filtered.`,
            COMMAND_FILTER_ADDED: word => `| ✅ | Success! Added the word ${word} to the filter.`,
            COMMAND_FILTER_REMOVED: word => `| ✅ | Success! Removed the word ${word} from the filter.`,
            COMMAND_FILTER_RESET: '| ✅ | Success! The filter has been reset.',

            COMMAND_LOCKDOWN_OPEN: channel => `The lockdown for the channel ${channel} has been released.`,
            COMMAND_LOCKDOWN_LOCKING: channel => `Locking the channel ${channel}...`,
            COMMAND_LOCKDOWN_LOCK: channel => `The channel ${channel} is now locked.`,

            COMMAND_LIST_CHANNELS: (name, id) => `List of channels for ${name} (${id})`,
            COMMAND_LIST_ROLES: (name, id) => `List of roles for ${name} (${id})`,
            COMMAND_LIST_MEMBERS: (name, id) => `List of members for the role ${name} (${id})`,
            COMMAND_LIST_INVITES: (name, id) => `List of invite links for ${name} (${id})`,
            COMMAND_LIST_STRIKES: name => `List of strikes${name ? `for ${name}` : ''}`,
            COMMAND_LIST_TRACKERS: amount => `List of (${amount}) trackers.`,
            COMMAND_LIST_TRACKERS_BY: (channel, user) => `${channel} is being tracked by ${user}`,
            COMMAND_LIST_TRACKERS_NONE: 'The tracking service is currently idle.',
            COMMAND_LIST_ADVERTISEMENT: 'List of members advertising.',
            COMMAND_LIST_ADVERTISEMENT_EMPTY: 'Nobody has an advertising url in its playing game.',

            /* Utils */
            COMMAND_ROLE_HIGHER: 'The selected member has higher or equal role position than you.',
            COMMAND_USERSELF: 'Why would you do that to yourself?',
            COMMAND_TOSKYRA: 'Eww... I thought you loved me! 💔',

            // OVERWATCH
            COMMAND_PLATFORM_REMOVED: (role) => `Your game platform (**${role}**) has been removed.`,
            COMMAND_PLATFORM_UPDATED: (role) => `Your game platform has been updated to: **${role}**`,
            COMMAND_REGION_REMOVED: (role) => `Your game region (**${role}**) has been removed.`,
            COMMAND_REGION_UPDATED: (role) => `Your game region has been updated to: **${role}**`,
            COMMAND_GAMEROLE_UPDATE: (role) => `Your game role has been updated to: **${role}**`,
            COMMAND_RANK_UPDATE: (rank) => `Your rank has been updated to: **${rank}**`,
            MISSING_ROLE: 'You do not have this role.',
            HAS_ROLE: 'You already have this role.',

            // SOCIAL
            COMMAND_SOCIAL_MYLEVEL: (points, next) => `You have a total of ${points} points.${next}`,
            COMMAND_SOCIAL_MYLEVEL_NEXT: (remaining, next) => `\nPoints for next rank: **${remaining}** (at ${next} points).`,
            COMMAND_SOCIAL_MISSING_MONEY: (needed, has, icon) => `I am sorry, but you need ${needed}${icon} and you have ${has}${icon}`,
            COMMAND_DAILY_TIME: time => `Next dailies are available in ${duration(time)}`,
            COMMAND_DAILY_TIME_SUCCESS: (amount, icon) => `Yay! You earned ${amount}${icon}! Next dailies in: 12 hours.`,
            COMMAND_DAILY_GRACE: remaining => [
                `Would you like to claim the dailies early? The remaining time will be added up to a normal 12h wait period.`,
                `Remaining time: ${duration(remaining, true)}`
            ].join('\n'),
            COMMAND_DAILY_GRACE_ACCEPTED: (amount, icon, remaining) => `Successfully claimed ${amount}${icon}! Next dailies in: ${duration(remaining, true)}`,
            COMMAND_DAILY_GRACE_DENIED: 'Got it! Come back soon!',
            COMMAND_PAY_PROMPT: (user, amount, icon) => `You are about to pay ${user} ${amount}${icon}, are you sure you want to proceed?`,
            COMMAND_PAY_PROMPT_ACCEPT: (user, amount, icon) => `Payment accepted, ${amount}${icon} has been sent to ${user}'s profile.`,
            COMMAND_PAY_PROMPT_DENY: 'Payment denied.',
            COMMAND_PAY_SELF: 'If I taxed this, you would lose money, therefore, do not try to pay yourself.',
            COMMAND_SOCIAL_PAY_BOT: 'Oh, sorry, but money is meaningless for bots, I am pretty sure a human would take advantage of it better.',

            COMMAND_PROFILE: {
                GLOBAL_RANK: 'Global Rank',
                CREDITS: 'Credits',
                REPUTATION: 'Reputation',
                EXPERIENCE: 'Experience',
                LEVEL: 'Level'
            },
            COMMAND_LEVEL: {
                LEVEL: 'Level',
                EXPERIENCE: 'Experience',
                NEXT_IN: 'Next level in'
            },
            COMMAND_SOCIAL_SLOTMACHINES_WIN: (roll, winnings, icon) => `**You rolled:**\n${roll}\n**Congratulations!**\nYou won ${winnings}${icon}!`,
            COMMAND_SOCIAL_SLOTMACHINES_LOSS: roll => `**You rolled:**\n${roll}\n**Mission failed!**\nWe'll get em next time!`,

            COMMAND_SUBSCRIBE_NO_ROLE: 'This server does not have a configured announcement role.',
            COMMAND_SUBSCRIBE_SUCCESS: (role) => `Successfully granted the role: **${role}**`,
            COMMAND_UNSUBSCRIBE_SUCCESS: (role) => `Successfully removed the role: **${role}***`,
            COMMAND_SUBSCRIBE_NO_CHANNEL: 'This server does not have a configured announcement channel.',
            COMMAND_ANNOUNCEMENT: (role) => `**New announcement for** ${role}:`,

            COMMAND_CONFIGURATION_ABORT: reason => `⚙ | Prompt System Cancelled: ${reason === 'TIME' ? 'Timed out.' : 'Successfully exited.'}`,

            COMMAND_CALC: (time, output) => `⚙ **Calculated** (${time}μs)${output}`,
            COMMAND_CALC_FAILURE: (time, output) => `|\`❌\`| **Failed** (${time}μs)${output}`,

            // Modlogs
            MODLOG_APPEALED: 'The selected moderation case has already been appealed.',
            MODLOG_TIMED: time => `This action is already scheduled and ending in ${time}`,

            // System only
            SYSTEM_DM_SENT: 'I have sent you the message in DMs.',
            SYSTEM_DM_FAIL: 'I cannot send you a message in DMs, did you block me?',
            SYSTEM_FETCHING: '`Fetching...`',
            SYSTEM_PROCESSING: '`Processing...`',
            SYSTEM_HIGHEST_ROLE: 'This role\'s hierarchy position is higher or equal than me, I am not able to grant it to anyone.',
            SYSTEM_CHANNEL_NOT_POSTABLE: 'I am not allowed to send messages to this channel.',
            SYSTEM_FETCHBANS_FAIL: `Failed to fetch bans. Do I have the ${PERMS.BAN_MEMBERS} permission?`,

            COMMAND_SUCCESS: 'Successfully executed the command.',

            GUILD_SETTINGS_CHANNELS_MOD: 'This command requires a modlog channel to work.',
            GUILD_SETTINGS_ROLES_MUTED: 'This command requires a configured role for mutes.',
            GUILD_BANS_EMPTY: 'There are no bans registered in this server.',
            GUILD_BANS_NOT_FOUND: 'Please, write a valid user ID or tag.',
            GUILD_MUTE_NOT_FOUND: 'This user is not muted.',

            USER_NOT_IN_GUILD: 'This user is not in this server.',

            EVENTS_GUILDMEMBERADD: 'User Joined',
            EVENTS_GUILDMEMBERADD_MUTE: 'Muted User joined',
            EVENTS_GUILDMEMBERADD_RAID: 'Raid Detected',
            EVENTS_GUILDMEMBERREMOVE: 'User left',
            EVENTS_GUILDMEMBER_UPDATE_NICKNAME: (previous, current) => `Updated the nickname from **${previous}** to **${current}**`,
            EVENTS_GUILDMEMBER_ADDED_NICKNAME: (previous, current) => `Added a new nickname **${current}**`,
            EVENTS_GUILDMEMBER_REMOVED_NICKNAME: previous => `Removed the nickname **${previous}**`,
            EVENTS_GUILDMEMBER_UPDATE_ROLES: (removed, added) => `${removed.length > 0 ? `Removed the role${removed.length > 1 ? 's' : ''}: ${removed.join(', ')}\n` : ''}${added.length > 0 ? `Added the role${added.length > 1 ? 's' : ''}: ${added.join(', ')}` : ''}`,
            EVENTS_MESSAGE_UPDATE: 'Message Edited',
            EVENTS_MESSAGE_UPDATE_MSG: (old, msg) => `Previous: ${old.substring(0, 950)}\nNew: ${msg.substring(0, 950)}`,
            EVENTS_MESSAGE_DELETE: 'Message Deleted',
            EVENTS_MESSAGE_DELETE_MSG: (msg) => msg.substring(0, 1900),
            EVENTS_COMMAND: command => `Command Used: ${command}`,
            EVENTS_STREAM_START: member => `The user **${member.user.tag}** is now live! **${member.presence.game.name}**\n${member.presence.game.url}`,
            EVENTS_STREAM_STOP: member => `The user **${member.user.tag}** is not longer live!`,

            SETTINGS_DELETE_CHANNELS_DEFAULT: 'Removed Settings Channels::default',
            SETTINGS_DELETE_ROLES_INITIAL: 'Removed Setting Roles::initial',
            SETTINGS_DELETE_ROLES_MUTE: 'Removed Setting Roles::mute',

            // Tags
            COMMAND_TAGS_NAME_REQUIRED: 'You must specify a tag name.',
            COMMAND_TAGS_ADD_EXISTS: tag => `The tag '${tag}' already exists.`,
            COMMAND_TAGS_CONTENT_REQUIRED: 'You must provide a content for this tag.',
            COMMAND_TAGS_ADD_ADDED: (name, content) => `Successfully added a new tag: **${name}** with a content of **${content}**.`,
            COMMAND_TAGS_REMOVE_NOT_EXISTS: tag => `The tag '${tag}' does not exist.`,
            COMMAND_TAGS_REMOVE_REMOVED: (name) => `Successfully removed the tag **${name}**.`,
            COMMAND_TAGS_EDITED: (name, content, old) => `Successfully edited the tag **${name}** which had a content of **${old}** to **${content}**.`,
            COMMAND_TAGS_LIST_EMPTY: 'The tag list for this server is empty.',

            TYPES_MEMBER_ROLE_UPDATE: 'Member Role Update',
            TYPES_MEMBER_NICKNAME_UPDATE: 'Member Nickname Update',

            LISTIFY_INVALID_INDEX: 'Invalid index, expected an integer.',

            CONST_USER: 'User',
            CONST_USERS: 'Users'
        };
    }

};
