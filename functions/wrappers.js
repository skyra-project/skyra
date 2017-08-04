const sanitizeEmbed = require('./embed');
const snekfetch = require('snekfetch');
const ms = require('ms');

exports.fetchAvatar = (user, size = 512) => {
    const url = user.avatar ? user.avatarURL({ format: 'png', size }) : user.defaultAvatarURL;
    return snekfetch.get(url).then(data => data.body).catch((err) => { throw `Could not download the profile avatar: ${err}`; });
};

exports.timer = (time) => {
    let msTime = 0;
    for (const ts of time[Symbol.iterator]()) { // eslint-disable-line no-restricted-syntax
        const parsed = ms(ts);
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
