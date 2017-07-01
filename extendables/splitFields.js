exports.conf = {
    type: "method",
    method: "splitFields",
    appliesTo: ["RichEmbed"],
};

// eslint-disable-next-line func-names
exports.extend = function (content) {
    if (content instanceof Array) content = content.join("\n");
    if (content.length <= 2000) this.setDescription(content);
    else {
        let init = content;
        let i;
        let x;

        for (i = 0; i < content.length / 1020; i++) {
            x = init.substring(0, 1020).lastIndexOf("\n");
            this.addField("\u200B", init.substring(0, x));
            init = init.substring(x, init.length);
        }
    }
    return this;
};
