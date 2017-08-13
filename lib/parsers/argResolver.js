const Resolver = require('./Resolver');

/**
 * The command argument resolver
 * @extends Resolver
 */
class ArgResolver extends Resolver {

    /**
	 * Resolves a command
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {Command}
	 */
    async command(...args) {
        return this.cmd(...args);
    }

    /**
	 * Resolves a command
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {Command}
	 */
    async cmd(arg, currentUsage, possible, repeat, msg) {
        const command = this.client.commands.get(arg);
        if (command) return command;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'command');
    }

    /**
	 * Resolves an event
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {Event}
	 */
    async event(arg, currentUsage, possible, repeat, msg) {
        const event = this.client.events.get(arg);
        if (event) return event;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'event');
    }

    /**
	 * Resolves an extendable
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {Event}
	 */
    async extendable(arg, currentUsage, possible, repeat, msg) {
        const extendable = this.client.extendables.get(arg);
        if (extendable) return extendable;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'extendable');
    }

    /**
	 * Resolves a finalizer
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {Finalizer}
	 */
    async finalizer(arg, currentUsage, possible, repeat, msg) {
        const finalizer = this.client.finalizers.get(arg);
        if (finalizer) return finalizer;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'finalizer');
    }

    /**
	 * Resolves a inhibitor
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {Inhibitor}
	 */
    async inhibitor(arg, currentUsage, possible, repeat, msg) {
        const inhibitor = this.client.inhibitors.get(arg);
        if (inhibitor) return inhibitor;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'inhibitor');
    }

    /**
	 * Resolves a monitor
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {Monitor}
	 */
    async monitor(arg, currentUsage, possible, repeat, msg) {
        const monitor = this.client.monitors.get(arg);
        if (monitor) return monitor;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'monitor');
    }

    /**
	 * Resolves a language
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {Language}
	 */
    async language(arg, currentUsage, possible, repeat, msg) {
        const language = this.client.languages.get(arg);
        if (language) return language;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'language');
    }
    /**
	 * Resolves a provider
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {Provider}
	 */
    async provider(arg, currentUsage, possible, repeat, msg) {
        const provider = this.client.providers.get(arg);
        if (provider) return provider;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'provider');
    }

    /**
	 * Resolves a message
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {external:Message}
	 */
    message(...args) {
        return this.msg(...args);
    }

    /**
	 * Resolves a message
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {external:Message}
	 */
    async msg(arg, currentUsage, possible, repeat, msg) {
        const message = await super.msg(arg, msg.channel);
        if (message) return message;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_MSG', currentUsage.possibles[possible].name);
    }

    /**
	 * Resolves a user
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {external:User}
	 */
    mention(...args) {
        return this.user(...args);
    }

    /**
	 * Resolves a user
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {external:User}
	 */
    async user(arg, currentUsage, possible, repeat, msg) {
        const user = await super.user(arg);
        if (user) return user;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_USER', currentUsage.possibles[possible].name);
    }

    async advuser(arg, currentUsage, possible, repeat, msg) {
        const user = await super.advUser(arg, msg);
        if (user) return user;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_USER', currentUsage.possibles[possible].name);
    }

    /**
	 * Resolves a member
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {external:GuildMember}
	 */
    async member(arg, currentUsage, possible, repeat, msg) {
        const member = await super.member(arg, msg.guild);
        if (member) return member;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_MEMBER', currentUsage.possibles[possible].name);
    }

    async advmember(arg, currentUsage, possible, repeat, msg) {
        const member = await super.advMember(arg, msg);
        if (member) return member;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_MEMBER', currentUsage.possibles[possible].name);
    }

    /**
	 * Resolves a channel
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {external:Channel}
	 */
    async channel(arg, currentUsage, possible, repeat, msg) {
        const channel = await super.channel(arg);
        if (channel) return channel;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_CHANNEL', currentUsage.possibles[possible].name);
    }

    async advchannel(arg, currentUsage, possible, repeat, msg) {
        const channel = await super.advChannel(arg, msg);
        if (channel) return channel;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_CHANNEL', currentUsage.possibles[possible].name);
    }

    /**
	 * Resolves a guild
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {external:Guild}
	 */
    async guild(arg, currentUsage, possible, repeat, msg) {
        const guild = await super.guild(arg);
        if (guild) return guild;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_GUILD', currentUsage.possibles[possible].name);
    }

    /**
	 * Resolves a role
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {external:Role}
	 */
    async role(arg, currentUsage, possible, repeat, msg) {
        const role = await super.role(arg, msg.guild);
        if (role) return role;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_ROLE', currentUsage.possibles[possible].name);
    }

    async advrole(arg, currentUsage, possible, repeat, msg) {
        const role = await super.advRole(arg, msg);
        if (role) return role;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_ROLE', currentUsage.possibles[possible].name);
    }

    /**
	 * Resolves a literal
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {string}
	 */
    async literal(arg, currentUsage, possible, repeat, msg) {
        if (arg.toLowerCase() === currentUsage.possibles[possible].name.toLowerCase()) return arg.toLowerCase();
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_LITERAL', currentUsage.possibles[possible].name);
    }

    /**
	 * Resolves a boolean
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {boolean}
	 */
    boolean(...args) {
        return this.bool(...args);
    }

    /**
	 * Resolves a boolean
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {boolean}
	 */
    async bool(arg, currentUsage, possible, repeat, msg) {
        const boolean = await super.boolean(arg);
        if (boolean !== null) return boolean;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_BOOL', currentUsage.possibles[possible].name);
    }

    /**
	 * Resolves a string
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {string}
	 */
    string(...args) {
        return this.str(...args);
    }

    /**
	 * Resolves a string
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {string}
	 */
    async str(arg, currentUsage, possible, repeat, msg) {
        const { min, max } = currentUsage.possibles[possible];
        if (this.constructor.minOrMax(arg.length, min, max, currentUsage, possible, repeat, msg, msg.language.get('RESOLVER_STRING_SUFFIX'))) return arg;
        return null;
    }

    /**
	 * Resolves a integer
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {number}
	 */
    integer(...args) {
        return this.int(...args);
    }

    /**
	 * Resolves a integer
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {number}
	 */
    async int(arg, currentUsage, possible, repeat, msg) {
        const { min, max } = currentUsage.possibles[possible];
        arg = await super.integer(arg);
        if (arg === null) {
            if (currentUsage.type === 'optional' && !repeat) return null;
            throw msg.language.get('RESOLVER_INVALID_INT', currentUsage.possibles[possible].name);
        }
        if (this.constructor.minOrMax(arg, min, max, currentUsage, possible, repeat, msg)) return arg;
        return null;
    }

    /**
	 * Resolves a number
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {number}
	 */
    num(...args) {
        return this.float(...args);
    }

    /**
	 * Resolves a number
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {number}
	 */
    number(...args) {
        return this.float(...args);
    }

    /**
	 * Resolves a number
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {number}
	 */
    async float(arg, currentUsage, possible, repeat, msg) {
        const { min, max } = currentUsage.possibles[possible];
        arg = await super.float(arg);
        if (arg === null) {
            if (currentUsage.type === 'optional' && !repeat) return null;
            throw msg.language.get('RESOLVER_INVALID_FLOAT', currentUsage.possibles[possible].name);
        }
        if (this.constructor.minOrMax(arg, min, max, currentUsage, possible, repeat, msg)) return arg;
        return null;
    }

    /**
	 * Resolves a hyperlink
	 * @param {string} arg This arg
	 * @param {Object} currentUsage This current usage
	 * @param {number} possible This possible usage id
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @returns {string}
	 */
    async url(arg, currentUsage, possible, repeat, msg) {
        const hyperlink = await super.url(arg);
        if (hyperlink !== null) return hyperlink;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw msg.language.get('RESOLVER_INVALID_URL', currentUsage.possibles[possible].name);
    }

    async attachment(arg, currentUsage, possible, repeat, msg) {
        const message = await super.attachment(arg, msg);
        if (message) return message;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw `${currentUsage.possibles[possible].name} must be a valid message attachment or url.`;
    }

    /**
	 * Checks min and max values
	 * @param {number} value The value to check against
	 * @param {?number} min The minimum value
	 * @param {?number} max The maxiumum value
	 * @param {Object} currentUsage The current usage
	 * @param {number} possible The id of the current possible usage
	 * @param {boolean} repeat If it is a looping/repeating arg
	 * @param {external:Message} msg The message that triggered the command
	 * @param {string} suffix An error suffix
	 * @returns {boolean}
	 */
    static minOrMax(value, min, max, currentUsage, possible, repeat, msg, suffix = '') {
        if (min && max) {
            if (value >= min && value <= max) return true;
            if (currentUsage.type === 'optional' && !repeat) return false;
            if (min === max) throw msg.language.get('RESOLVER_MINMAX_EXACTLY', currentUsage.possibles[possible].name, min, suffix);
            throw msg.language.get('RESOLVER_MINMAX_BOTH', currentUsage.possibles[possible].name, min, max, suffix);
        } else if (min) {
            if (value >= min) return true;
            if (currentUsage.type === 'optional' && !repeat) return false;
            throw msg.language.get('RESOLVER_MINMAX_MIN', currentUsage.possibles[possible].name, min, suffix);
        } else if (max) {
            if (value <= max) return true;
            if (currentUsage.type === 'optional' && !repeat) return false;
            throw msg.language.get('RESOLVER_MINMAX_MAX', currentUsage.possibles[possible].name, max, suffix);
        }
        return true;
    }

}

module.exports = ArgResolver;
