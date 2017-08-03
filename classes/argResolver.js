const Resolver = require('./Resolver');

/* eslint-disable class-methods-use-this */
module.exports = class ArgResolver extends Resolver {

    message(...args) {
        return this.msg(...args);
    }

    async msg(arg, currentUsage, possible, repeat, msg) {
        const message = await super.msg(arg, msg.channel);
        if (message) return message;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw `${currentUsage.possibles[possible].name} must be a valid message id.`;
    }

    mention(...args) {
        return this.user(...args);
    }

    async user(arg, currentUsage, possible, repeat) {
        const user = await super.user(arg);
        if (user) return user;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw `${currentUsage.possibles[possible].name} must be a mention or valid user id.`;
    }

    async advuser(arg, currentUsage, possible, repeat, msg) {
        const user = await super.advUser(arg, msg);
        if (user) return user;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw `${currentUsage.possibles[possible].name} must be a valid mention or a part of the name.`;
    }

    async member(arg, currentUsage, possible, repeat, msg) {
        const member = await super.member(arg, msg.guild);
        if (member) return member;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw `${currentUsage.possibles[possible].name} must be a mention or valid user id.`;
    }

    async advmember(arg, currentUsage, possible, repeat, msg) {
        const member = await super.advMember(arg, msg);
        if (member) return member;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw `${currentUsage.possibles[possible].name} must be a valid mention or a part of the name.`;
    }

    async channel(arg, currentUsage, possible, repeat) {
        const channel = await super.channel(arg);
        if (channel) return channel;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw `${currentUsage.possibles[possible].name} must be a channel tag or valid channel id.`;
    }

    async advchannel(arg, currentUsage, possible, repeat, msg) {
        const channel = await super.advChannel(arg, msg);
        if (channel) return channel;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw `${currentUsage.possibles[possible].name} must be a channel tag or a part of the name.`;
    }

    async guild(arg, currentUsage, possible, repeat) {
        const guild = await super.guild(arg);
        if (guild) return guild;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw `${currentUsage.possibles[possible].name} must be a valid guild id.`;
    }

    async role(arg, currentUsage, possible, repeat, msg) {
        const role = await super.role(arg, msg.guild);
        if (role) return role;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw `${currentUsage.possibles[possible].name} must be a role mention or role id.`;
    }

    async advrole(arg, currentUsage, possible, repeat, msg) {
        const role = await super.advRole(arg, msg);
        if (role) return role;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw `${currentUsage.possibles[possible].name} must be a role mention or a part of the name.`;
    }

    async literal(arg, currentUsage, possible, repeat) {
        if (arg.toLowerCase() === currentUsage.possibles[possible].name.toLowerCase()) return arg.toLowerCase();
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw [
            `Your option did not literally match the only possibility: (${currentUsage.possibles.map(poss => poss.name).join(', ')})`,
            'This is likely caused by a mistake in the usage string.'
        ].join('\n');
    }

    bool(...args) {
        return this.boolean(...args);
    }

    async boolean(arg, currentUsage, possible, repeat) {
        const boolean = await super.boolean(arg);
        if (boolean !== null) return boolean;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw `${currentUsage.possibles[possible].name} must be true or false.`;
    }

    str(...args) {
        return this.string(...args);
    }

    async string(arg, currentUsage, possible, repeat) {
        const { min, max } = currentUsage.possibles[possible];
        if (min && max) {
            if (arg.length >= min && arg.length <= max) return arg;
            if (currentUsage.type === 'optional' && !repeat) return null;
            if (min === max) throw `${currentUsage.possibles[possible].name} must be exactly ${min} characters.`;
            throw `${currentUsage.possibles[possible].name} must be between ${min} and ${max} characters.`;
        } else if (min) {
            if (arg.length >= min) return arg;
            if (currentUsage.type === 'optional' && !repeat) return null;
            throw `${currentUsage.possibles[possible].name} must be longer than ${min} characters.`;
        } else if (max) {
            if (arg.length <= max) return arg;
            if (currentUsage.type === 'optional' && !repeat) return null;
            throw `${currentUsage.possibles[possible].name} must be shorter than ${max} characters.`;
        }
        return arg;
    }

    int(...args) {
        return this.integer(...args);
    }

    async integer(arg, currentUsage, possible, repeat) {
        const { min, max } = currentUsage.possibles[possible];
        arg = await super.integer(arg);
        if (arg === null) {
            if (currentUsage.type === 'optional' && !repeat) return null;
            throw `${currentUsage.possibles[possible].name} must be an integer.`;
        } else if (min && max) {
            if (arg >= min && arg <= max) return arg;
            if (currentUsage.type === 'optional' && !repeat) return null;
            if (min === max) throw `${currentUsage.possibles[possible].name} must be exactly ${min}\nSo why didn't the dev use a literal?`;
            throw `${currentUsage.possibles[possible].name} must be between ${min} and ${max}.`;
        } else if (min) {
            if (arg >= min) return arg;
            if (currentUsage.type === 'optional' && !repeat) return null;
            throw `${currentUsage.possibles[possible].name} must be greater than ${min}.`;
        } else if (max) {
            if (arg <= max) return arg;
            if (currentUsage.type === 'optional' && !repeat) return null;
            throw `${currentUsage.possibles[possible].name} must be less than ${max}.`;
        }
        return arg;
    }

    num(...args) {
        return this.float(...args);
    }

    number(...args) {
        return this.float(...args);
    }

    async float(arg, currentUsage, possible, repeat) {
        const { min, max } = currentUsage.possibles[possible];
        arg = await super.float(arg);
        if (arg === null) {
            if (currentUsage.type === 'optional' && !repeat) return null;
            throw `${currentUsage.possibles[possible].name} must be a valid number.`;
        } else if (min && max) {
            if (arg >= min && arg <= max) return arg;
            if (currentUsage.type === 'optional' && !repeat) return null;
            if (min === max) throw `${currentUsage.possibles[possible].name} must be exactly ${min}\nSo why didn't the dev use a literal?`;
            throw `${currentUsage.possibles[possible].name} must be between ${min} and ${max}.`;
        } else if (min) {
            if (arg >= min) return arg;
            if (currentUsage.type === 'optional' && !repeat) return null;
            throw `${currentUsage.possibles[possible].name} must be greater than ${min}.`;
        } else if (max) {
            if (arg <= max) return arg;
            if (currentUsage.type === 'optional' && !repeat) return null;
            throw `${currentUsage.possibles[possible].name} must be less than ${max}.`;
        }
        return arg;
    }

    async url(arg, currentUsage, possible, repeat) {
        const hyperlink = await super.url(arg);
        if (hyperlink !== null) return hyperlink;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw `${currentUsage.possibles[possible].name} must be a valid url.`;
    }

    async attachment(arg, currentUsage, possible, repeat, msg) {
        const message = await super.attachment(arg, msg);
        if (message) return message;
        if (currentUsage.type === 'optional' && !repeat) return null;
        throw `${currentUsage.possibles[possible].name} must be a valid message attachment or url.`;
    }

};
