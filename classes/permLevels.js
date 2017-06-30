module.exports = class PermissionLevels {

    constructor() {
        this.levels = new Map();
    }

    addLevel(level, brk, chk) {
        if (this.levels.has(level)) throw new Error(`Level ${level} is already defined`);
        this.levels.set(level, { break: brk, check: chk });
        return this;
    }

    get structure() {
        const structure = [];
        for (let i = 0; i < 11; i++) {
            const myLevel = this.levels.get(i);
            if (myLevel) structure.push(myLevel);
            else structure.push({ break: false, check: () => false });
        }
        return structure;
    }

};
