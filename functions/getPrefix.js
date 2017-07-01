const { prefix: getPrefix } = require("../utils/guildManager.js");
const regExpEsc = require("./regExpEsc");

const friendly = new RegExp("^((?:Hey )?Skyra(?:,|!) +)", "i");
const prefixCheck = (prefix, str) => {
    for (let i = prefix.length - 1; i >= 0; i--) {
        if (str[i] === prefix[i]) continue;
        return false;
    }
    return true;
};

module.exports = (client, msg) => {
    const prefix = msg.guild ? getPrefix(msg.guild) : "&";
    if (prefixCheck(prefix, msg.content)) return new RegExp(`^${regExpEsc(prefix)}`);
    else if (friendly.test(msg.content)) return friendly;
    else if (client.config.prefixMention.test(msg.content)) return client.config.prefixMention;
    return false;
};
