const ManagerSocialLocal = require("../utils/managerSocialLocal");
const { MemberScore, defaults } = require("../utils/memberScore.js");

exports.conf = {
    type: "get",
    method: "points",
    appliesTo: ["GuildMember"],
};

const init = (member) => {
    const profile = new MemberScore(member.id, member.guild.id, Object.assign(defaults, { id: member.id, exists: false }));
    ManagerSocialLocal.get(member.guild.id).set(member.id, profile);
    return profile;
};

// eslint-disable-next-line func-names
exports.extend = function () {
    return ManagerSocialLocal.fetch(this.guild.id, this.id) || init(this);
};
