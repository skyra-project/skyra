/* SuperFast Search */
const startsWith = (prefix, str) => {
    str = str.toLowerCase();
    for (let i = prefix.length - 1; i >= 0; i--) {
        if (str[i] === prefix[i]) continue;
        return false;
    }
    return true;
};
/* eslint-disable no-restricted-syntax */
const includes = (property, chunk) => property.toLowerCase().includes(chunk);

/* Methods */
exports.Role = (query, guild) => {
    switch (query.constructor.name) {
        case 'Role': return query;
        case 'String': {
            if (/[0-9]{17,21}/.test(query)) {
                const ID = /[0-9]{17,21}/.exec(query)[0];
                const role = guild.roles.get(ID);
                if (role) return role;
                throw `Invalid ID: ${query}`;
            } else {
                const lowerCaseQuery = query.toLowerCase();
                const result = guild.roles.find(r => r.name.toLowerCase() === lowerCaseQuery) ||
                    guild.roles.find(r => startsWith(lowerCaseQuery, r.name)) ||
                    guild.roles.find(r => includes(r.name, lowerCaseQuery));
                if (result) return result;
                throw `Role not found: ${query}`;
            }
        }
        default: throw 'Invalid input.';
    }
};

exports.Channel = (query, guild) => {
    switch (query.constructor.name) {
        case 'TextChannel': return query;
        case 'String': {
            if (/[0-9]{17,21}/.test(query)) {
                const ID = /[0-9]{17,21}/.exec(query)[0];
                const channel = guild.channels.get(ID);
                if (channel) return channel;
                throw `Invalid ID: ${query}`;
            } else {
                const lowerCaseQuery = query.toLowerCase();
                const result = guild.channels.find(c => c.name.toLowerCase() === lowerCaseQuery) ||
                    guild.channels.find(c => startsWith(lowerCaseQuery, c.name)) ||
                    guild.channels.find(c => includes(c.name, lowerCaseQuery));
                if (result) return result;
                throw `Channel not found: ${query}`;
            }
        }
        default: throw 'Invalid input.';
    }
};

/* eslint-disable no-confusing-arrow */
exports.User = async (query, guild, strict = false) => {
    switch (query.constructor.name) {
        case 'User': return query;
        case 'GuildMember': return query.user;
        case 'String': {
            let result;
            const lowerCaseQuery = query.toLowerCase();
            if (/[0-9]{17,21}/.test(query)) {
                const ID = /[0-9]{17,21}/.exec(query)[0];
                return guild.client.fetchUser(ID).catch(() => { throw `User not found: ${query}`; });
            } else if (strict) {
                if (/.{2,25}#[0-9]{4}/.test(query)) {
                    result = guild.members.find(m => m.user.tag.toLowerCase() === lowerCaseQuery);
                    if (result) return result.user;
                }
                throw 'You must provide an mention, ID, or full Discord tag';
            } else {
                result = guild.members.find(m => m.user.tag.toLowerCase() === lowerCaseQuery) ||
                    guild.members.find(m => m.user.username.toLowerCase() === lowerCaseQuery) ||
                    guild.members.find(m => m.nickname ? m.nickname.toLowerCase() === lowerCaseQuery : false) ||
                    guild.members.find(m => startsWith(lowerCaseQuery, m.user.username)) ||
                    guild.members.find(m => m.nickname ? startsWith(lowerCaseQuery, m.nickname) : false) ||
                    guild.members.find(m => includes(m.user.username, lowerCaseQuery)) ||
                    guild.members.find(m => m.nickname ? includes(m.nickname, lowerCaseQuery) : false);
                if (result) return result.user;
                throw `User not found: ${query}`;
            }
        }
        default: throw 'Invalid input.';
    }
};
