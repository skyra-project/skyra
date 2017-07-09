exports.conf = {
    type: "get",
    method: "settings",
    appliesTo: ["Guild"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
    return {
        prefix: "$",
    };
};
