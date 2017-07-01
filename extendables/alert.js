exports.conf = {
    type: "method",
    method: "alert",
    appliesTo: ["Message"],
};

// eslint-disable-next-line func-names
exports.extend = function (content, timer = 10000) {
    if (!this.channel.postable) return null;
    return this.send(content).then(m => m.nuke(timer));
};
