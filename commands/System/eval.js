const Command = require("../../classes/command");
const { inspect } = require("util");
const clean = require("../../functions/clean");
const now = require("performance-now");

/* eslint-disable no-eval */
module.exports = class Eval extends Command {

    constructor(...args) {
        super(...args, "eval", {
            aliases: ["ev"],
            botPerms: ["EMBED_LINKS"],
            usage: "<expression:str>",
            description: "Evaluates arbitrary Javascript.",
            permLevel: 10,
        });
    }

    async run(msg, [args]) {
        const send = [];
        const start = now();
        const { type, input } = this.parse(args.split(" "));
        try {
            const toEval = type ? `(async () => { ${input} })()` : input;
            const res = await eval(toEval);
            const time = now() - start;

            let out;
            if (typeof res === "object" && typeof res !== "string") {
                out = inspect(res, { depth: 0, showHidden: true });
                if (typeof out === "string" && out.length > 1900) out = res.toString();
            } else { out = res; }

            send.push(`➡ **Input:** Executed in ${time.toFixed(5)}μs${"```"}js`);
            send.push(`${input.replace(/```/g, "`\u200b``")}${"```"}`);
            send.push("🔍 **Inspect:**```js");
            send.push(`${clean(this.client, out)}${"```"}`);
        } catch (err) {
            send.push(`➡ **Input:** Executed in ${(now() - start).toFixed(5)}μs${"```"}js`);
            send.push(`${input.replace(/```/g, "`\u200b``")}${"```"}`);
            send.push("❌ **Error:**```js");
            send.push(`${(err ? err.message || err : "< void >")}${"```"}`);
        }

        return msg.send(send.join("\n")).catch(err => msg.error(err));
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
