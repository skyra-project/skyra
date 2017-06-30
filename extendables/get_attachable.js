exports.conf = {
    type: "get",
    method: "attachable",
    appliesTo: ["GroupDMChannel", "DMChannel", "TextChannel"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
    if (!this.guild) return true;
    return this.postable && this.permissionsFor(this.guild.me).has("ATTACH_FILES");
};
