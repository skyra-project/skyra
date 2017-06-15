exports.conf = {
  type: "get",
  method: "shiny",
  appliesTo: ["Message"],
};

// eslint-disable-next-line func-names
exports.extend = function () {
  return this.channel.permissionsFor(this.guild.me).has("USE_EXTERNAL_EMOJIS") ? "<:ShinyYellow:324157128270938113>" : "S";
};
