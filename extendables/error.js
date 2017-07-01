exports.conf = {
    type: "method",
    method: "error",
    appliesTo: ["Message"],
};

// eslint-disable-next-line func-names
exports.extend = function (content, log = false) {
    if (log) this.client.emit("error", content);
    return this.alert(`|\`❌\`| **ERROR**:\n${"```"}js\n${content}${"```"}`);
};
