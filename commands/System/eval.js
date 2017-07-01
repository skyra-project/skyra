const { inspect } = require("util");
const clean = require("../../functions/clean");
const now = require("performance-now");

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
    const send = [];
    const start = now();
    const { type, input } = this.parse(args.split(" "));
    try {
    // EVAL
        const toEval = type ? `(async () => { ${input} })()` : input;
        const res = await eval(toEval);
        const time = now() - start;

    // INSPECT
        let out;
        if (typeof res === "object" && typeof res !== "string") {
            out = inspect(res, { depth: 0, showHidden: true });
            if (typeof out === "string" && out.length > 1900) out = res.toString();
        } else { out = res; }

    // SEND MESSAGE
        send.push(`➡ **Input:** Executed in ${time.toFixed(5)}μs${"```"}js`);
        send.push(`${input.replace(/```/g, "`\u200b``")}${"```"}`);
        send.push("🔍 **Inspect:**```js");
        send.push(`${clean(client, out)}${"```"}`);
    } catch (err) {
        send.push(`➡ **Input:** Executed in ${(now() - start).toFixed(5)}μs${"```"}js`);
        send.push(`${input.replace(/```/g, "`\u200b``")}${"```"}`);
        send.push("❌ **Error:**```js");
        send.push(`${(err ? err.message || err : "< void >")}${"```"}`);
    }
    return msg.send(send.join("\n")).catch(err => msg.error(err));
};

exports.conf = {
    enabled: true,
    runIn: ["text", "dm", "group"],
    aliases: ["ev"],
    permLevel: 10,
    botPerms: [],
    requiredFuncs: [],
    spam: false,
    mode: 2,
};

exports.help = {
    name: "eval",
    description: "Evaluates arbitrary Javascript. Not for the faint of heart.",
    usage: "<expression:string>",
    usageDelim: "",
    extendedHelp: "",
};
