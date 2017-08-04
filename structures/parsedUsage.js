/* eslint-disable no-throw-literal, class-methods-use-this */
module.exports = class ParsedUsage {

    constructor(client, command) {
        Object.defineProperty(this, 'client', { value: client });
        this.names = [command.help.name, ...command.conf.aliases];
        this.commands = this.names.length === 1 ? this.names[0] : `(${this.names.join('|')})`;
        this.deliminatedUsage = command.help.usage !== '' ? ` ${command.help.usage.split(' ').join(command.help.usageDelim)}` : '';
        this.usageString = command.help.usage;
        this.parsedUsage = this.parseUsage();
        this.nearlyFullUsage = `${this.commands}${this.deliminatedUsage}`;
    }

    fullUsage(msg) {
        const prefix = msg.guildSettings.prefix;
        return `${prefix.length !== 1 ? `${prefix} ` : prefix}${this.nearlyFullUsage}`;
    }

    parseUsage() {
        let usage = {
            tags: [],
            opened: 0,
            current: '',
            openReq: false,
            last: false,
            char: 0,
            from: 0,
            at: '',
            fromto: ''
        };

        this.usageString.split('').forEach((com, i) => {
            usage.char = i + 1;
            usage.from = usage.char - usage.current.length;
            usage.at = `at char #${usage.char} '${com}'`;
            usage.fromto = `from char #${usage.from} to #${usage.char} '${usage.current}'`;

            if (usage.last && com !== ' ') {
                throw `${usage.at}: there can't be anything else after the repeat tag.`;
            }

            if (this[com]) {
                usage = this[com](usage);
            } else {
                usage.current += com;
            }
        });

        if (usage.opened) throw `from char #${this.usageString.length - usage.current.length} '${this.usageString.substr(-usage.current.length - 1)}' to end: a tag was left open`;
        if (usage.current) throw `from char #${(this.usageString.length + 1) - usage.current.length} to end '${usage.current}' a literal was found outside a tag.`;

        return usage.tags;
    }

    ['<'](usage) {
        if (usage.opened) throw `${usage.at}: you might not open a tag inside another tag.`;
        if (usage.current) throw `${usage.fromto}: there can't be a literal outside a tag`;
        usage.opened++;
        usage.openReq = true;
        return usage;
    }

    ['>'](usage) {
        if (!usage.opened) throw `${usage.at}: invalid close tag found`;
        if (!usage.openReq) throw `${usage.at}: Invalid closure of '[${usage.current}' with '>'`;
        usage.opened--;
        if (usage.current) {
            usage.tags.push({
                type: 'required',
                possibles: this.parseTag(usage.current, usage.tags.length + 1)
            });
            usage.current = '';
        } else { throw `${usage.at}: empty tag found`; }
        return usage;
    }

    ['['](usage) {
        if (usage.opened) throw `${usage.at}: you might not open a tag inside another tag.`;
        if (usage.current) throw `${usage.fromto}: there can't be a literal outside a tag`;
        usage.opened++;
        usage.openReq = false;
        return usage;
    }

    [']'](usage) {
        if (!usage.opened) throw `${usage.at}: invalid close tag found`;
        if (usage.openReq) throw `${usage.at}: Invalid closure of '<${usage.current}' with ']'`;
        usage.opened--;
        if (usage.current === '...') {
            if (usage.tags.length < 1) { throw `${usage.fromto}: there can't be a loop at the begining`; }
            usage.tags.push({ type: 'repeat' });
            usage.last = true;
            usage.current = '';
        } else if (usage.current) {
            usage.tags.push({
                type: 'optional',
                possibles: this.parseTag(usage.current, usage.tags.length + 1)
            });
            usage.current = '';
        } else { throw `${usage.at}: empty tag found`; }
        return usage;
    }

    [' '](usage) {
        if (usage.opened) throw `${usage.at}: spaces aren't allowed inside a tag`;
        if (usage.current) throw `${usage.fromto}: there can't be a literal outside a tag.`;
        return usage;
    }

    ['\n'](usage) {
        throw `${usage.at}: there can't be a line break in the command!`;
    }

    parseTag(tag, count) {
        const literals = [];
        const types = [];
        const toRet = [];

        const members = tag.split('|');

        members.forEach((elemet, i) => {
            const current = `at tag #${count} at bound #${i + 1}`;

            const result = /^([^:]+)(?::([^{}]+))?(?:{([^,]+)?(?:,(.+))?})?$/i.exec(elemet);

            if (!result) throw `${current}: invalid syntax, non specific`;

            const fill = {
                name: result[1],
                type: result[2] ? result[2].toLowerCase() : 'literal'
            };

            if (result[3]) {
                const proto = ' in the type length (min): ';

                if (fill.type === 'literal') throw `${current + proto}you cannot set a length for a literal type`;

                if (isNaN(result[3])) throw `${current + proto}must be a number`;

                const temp = parseFloat(result[3]);
                if ((fill.type === 'string' || fill.type === 'str') && temp % 1 !== 0) throw `${current + proto}the string type must have an integer length`;

                fill.min = temp;
            }

            if (result[4]) {
                const proto = ' in the type length (max): ';
                if (fill.type === 'literal') throw `${current + proto}you canno't set a length for a literal type`;

                if (isNaN(result[4])) throw `${current + proto}must be a number`;

                const temp = parseFloat(result[4]);

                if ((fill.type === 'string' || fill.type === 'str') && temp % 1 !== 0) throw `${current + proto}the string type must have an integer length`;
                fill.max = temp;
            }

            if (fill.type === 'literal') {
                if (literals.includes(fill.name)) throw `${current}: there can't be two literals with the same text.`;

                literals.push(fill.name);
            } else if (members.length > 1) {
                if (fill.type === 'string' && members.length - 1 !== i) throw `${current}: the String type is vague, you must specify it at the last bound`;
                if (types.includes(fill.type)) throw `${current}: there can't be two bounds with the same type (${fill.type})`;
                types.push(fill.type);
            }

            toRet.push(fill);
        });

        return toRet;
    }

};
