class SkyraError {

    constructor(error, code = null) {
        if (error.status) {
            this.statusCode = error.response.res.statusCode;
            this.statusMessage = error.response.res.statusMessage;
            this.code = error.response.body.code;
            this.message = error.response.body.message;
            return this;
        }
        this.code = code;
        this.message = error;
        this.stack = error.stack || null;
    }

    toString() {
        return this.message || '<void>';
    }

    toStack() {
        return this.stack || this.toString();
    }

}

module.exports = SkyraError;
