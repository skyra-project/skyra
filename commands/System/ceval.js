const Command = require("../../classes/command");

/* eslint-disable no-eval */
module.exports = class ClearEval extends Command {

    constructor(...args) {
        super(...args, "ceval", {
            aliases: ["cev"],
            permLevel: 10,
            mode: 2,

            usage: "<expression:string>",
            description: "Evaluates arbitrary Javascript.",
        });
    }

    async run(msg, [args]) {
        const { type, input } = this.parse(args.split(" "));
        const toEval = type ? `(async () => { ${input} })()` : input;
        await eval(toEval);
        if (Command.hasPermission("ADD_REACTIONS")) return msg.react("👌🏽").catch(() => msg.alert("Executed!"));
        return null;
    }

    parse(toEval) {
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
    }

};
