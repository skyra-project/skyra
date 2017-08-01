const sanitizeEmbed = require('./embed');
const snekfetch = require('snekfetch');
const ms = require('ms');

/* eslint-disable no-underscore-dangle */
exports.fetchAvatar = (user, size = 512) => {
    const url = user.avatar ? user.avatarURL({ format: 'png', size }) : user.defaultAvatarURL;
    return snekfetch.get(url).then(data => data.body).catch((e) => { throw new Error(`Could not download the profile avatar: ${e}`); });
};

exports.timer = (time) => {
    let msTime = 0;
    for (const t of time[Symbol.iterator]()) { // eslint-disable-line no-restricted-syntax
        const parsed = ms(t);
        if (parsed === undefined) throw new Error('Invalid time input.');
        msTime += parsed;
    }
    return msTime;
};

exports.copyPaste = (msg) => {
    const embed = msg.embeds.length ? sanitizeEmbed(msg.embeds[0]) : null;
    const content = msg.content;
    return msg.channel.send(content, { embed });
};
