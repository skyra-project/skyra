const DayOfWeek = {
    short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    long: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
};
const Months = {
    short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
    long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};

const fill = number => String(number).length === 1 ? `0${number}` : number;

class Timer {

    constructor(text) {
        this.date = Date.now();
        this.duration(text);
    }

    /**
     * Parse a string into duration.
     * @param {(string|string[])} [text=''] The string to parse.
     * @returns {void}
     */
    duration(text = '') {
        if (Array.isArray(text)) text = text.join(' ');
        if (typeof text !== 'string') throw 'Invalid input';
        if (text.length === 0) return;
        const times = text.split(/,? +/);

        for (let i = 0; i < times.length; i++) {
            const current = times[i];

            if (/^\d*(?:\.\d+)?$/.test(current) === false) continue;
            let type = null;
            if (i + 1 > times.length || /^\d*(?:\.\d+)?$/.test(times[i + 1])) type = 'MILLISECOND';
            else type = Timer.parseText(times[++i]);

            if (type === null) throw 'Invalid input';

            this.date += this.getTime(current, type);
        }
    }

    /**
     * Change the type in any unit of measurement given a number.
     * @param {number} time In integer, the new 'moment' to set.
     * @param {('MILLISECOND'|'SECOND'|'MINUTE'|'HOUR'|'DAY'|'MONTH'|'YEAR')} type The unit of date measurement.
     * @returns {Timer}
     * @chainable
     */
    atTime(time, type) {
        const num = parseInt(time);
        if (isNaN(num)) throw `Invalid input at ${time}; 'time' must be an Integer.`;

        switch (type) {
            case 'MILLISECOND': this.date = this.Date.setUTCMilliseconds(num);
                break;
            case 'SECOND': this.date = this.Date.setUTCMinutes(num);
                break;
            case 'MINUTE': this.date = this.Date.setUTCMinutes(num);
                break;
            case 'HOUR': this.date = this.Date.setUTCHours(num);
                break;
            case 'DAY': this.date = this.Date.setUTCDate(num);
                break;
            case 'MONTH': this.date = this.Date.setUTCMonth(num - 1);
                break;
            case 'YEAR': this.date = this.Date.setUTCFullYear(num);
                break;
            // no default
        }

        return this;
    }

    /**
     * Parse a RFC2822 or ISO 8601 date.
     * @param {string} date The date to parse.
     * @returns {Timer}
     * @chainable
     */
    Parse(date) {
        const value = Date.parse(date);
        this.date = value;
        return this;
    }

    /**
     * @typedef  {Object} JSONDate
     * @property {number} YEAR
     * @property {number} MONTH
     * @property {number} DAY
     * @property {number} DAY_OF_WEEK
     * @property {number} HOUR
     * @property {number} MINUTE
     * @property {number} SECOND
     * @property {number} MILLISECOND
     * @memberof Timer
     */

    /**
     * Get the UTC date.
     * @param {Date} [date=this.Date] The Date instance to get the data from.
     * @return {JSONDate}
     */
    toJSON(date = this.Date) {
        return {
            YEAR: date.getUTCFullYear(),
            MONTH: date.getUTCMonth(),
            DAY: date.getUTCDate(),
            DAY_OF_WEEK: date.getUTCDay(),
            HOUR: date.getUTCHours(),
            MINUTE: date.getUTCMinutes(),
            SECOND: date.getUTCSeconds(),
            MILLISECOND: date.getUTCMilliseconds()
        };
    }

    /**
     * Get the current date as a string.
     * @returns {string}
     */
    toString() {
        const data = this.toJSON();
        return `${DayOfWeek.short[data.DAY_OF_WEEK]}, ${data.DAY} ${Months.short[data.MONTH]} ${data.YEAR} at ${data.HOUR}:${fill(data.MINUTE)}:${fill(data.SECOND)}`;
    }

    /**
     * Gets the time in millisecond given an amount and its type.
     * @param {number} time The time
     * @param {('MILLISECOND'|'SECOND'|'MINUTE'|'HOUR'|'DAY'|'WEEK'|'MONTH'|'YEAR')} type The type
     * @returns {?number}
     * @memberof Timer
     */
    getTime(time, type) {
        const num = parseFloat(time);
        if (isNaN(num)) throw `Invalid input at ${time}::${type}; 'time' must be a float number.`;

        switch (type) {
            case 'MILLISECOND': return Math.floor(num);
            case 'SECOND': return Math.floor(num * 1000);
            case 'MINUTE': return Math.floor(num * 60000);
            case 'HOUR': return Math.floor(num * 3600000);
            case 'DAY': return Math.floor(num * 86400000);
            case 'WEEK': return Math.floor(num * 604800000);
            case 'MONTH': return Math.floor(num * 2551392000);
            case 'YEAR': return Math.floor(num * 31557600000);
            // no default
        }

        return null;
    }

    /**
     * Get the duration added to the current timestamp.
     * @returns {number}
     * @readonly
     */
    get Duration() {
        return this.date - Date.now();
    }

    /**
     * Get the Date
     * @returns {Date}
     * @readonly
     */
    get Date() {
        return new Date(this.date);
    }

    /**
     * Parse the values from the given string.
     * @param {string} text The string to parse.
     * @returns {('MILLISECOND'|'SECOND'|'MINUTE'|'HOUR'|'DAY'|'WEEK'|'MONTH'|'YEAR')}
     * @static
     */
    static parseText(text) {
        if (/^m(?:illi)?s(?:ec(?:ond)?s?)?$/.test(text)) return 'MILLISECOND';
        if (/^s(?:ec(?:ond)?s?)?$/.test(text)) return 'SECOND';
        if (/^m(?:in(?:ute)?s?)?$/.test(text)) return 'MINUTE';
        if (/^h(?:(?:r|our)s?)?$/.test(text)) return 'HOUR';
        if (/^d(?:ays?)?$/.test(text)) return 'DAY';
        if (/^w(?:eeks?)?$/.test(text)) return 'WEEK';
        if (/^m(?:onths?)?$/.test(text)) return 'MONTH';
        if (/^y(?:(?:r|ear)s?)?$/.test(text)) return 'YEAR';
        return null;
    }

    static utils() {
        return { DayOfWeek, Months };
    }

}

module.exports = Timer;
