exports.conf = {
    type: "method",
    method: "hasLevel",
    appliesTo: ["Message"],
};

// eslint-disable-next-line func-names
exports.extend = function (min) {
    return !!this.client.funcs.checkPerms(this.client, this, min);
};
