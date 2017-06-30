exports.parse = (toEval) => {
    let input;
    let type;
    if (toEval[0] === "async") {
        input = toEval.slice(1).join(" ");
        type = true;
    } else {
        input = toEval.join(" ");
        type = false;
    }
    return { type, input };
};

/* eslint-disable no-eval */
exports.run = async (client, msg, [args]) => {
    const { type, input } = this.parse(args.split(" "));
    const toEval = type ? `(async () => { ${input} })()` : input;
    await eval(toEval);
    if (msg.channel.permissionsFor(msg.guild.me).has("ADD_REACTIONS")) msg.react("👌🏽").catch(() => msg.alert("Executed!"));
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: ["cev"],
    permLevel: 10,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
};

exports.help = {
    name: "ceval",
    description: "Evaluates arbitrary Javascript. Not for the faint of heart.",
    usage: "<expression:string>",
    usageDelim: "",
    extendedHelp: "",
};
