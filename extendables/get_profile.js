const ManagerSocialGlobal = require("../utils/managerSocialGlobal");
const UserProfile = require("../utils/userProfile");

exports.conf = {
    type: "get",
    method: "profile",
    appliesTo: ["User"],
};

const init = (user) => {
    const profile = new UserProfile(user);
    ManagerSocialGlobal.set(user.id, profile);
    return profile;
};

// eslint-disable-next-line func-names
exports.extend = function () {
    return ManagerSocialGlobal.get(this.id) || init(this);
};
