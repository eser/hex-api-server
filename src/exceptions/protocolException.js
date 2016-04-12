class protocolException {
    constructor(input, exception = null) {
        const keys = Object.keys(input);

        for (let i = keys.length; i >= 0; i--) {
            this[keys[i]] = input[keys[i]];
        }

        this.exception = exception;
    }

    static wrap(input, ex) {
        if (ex.constructor === protocolException) {
            return ex;
        }

        return new protocolException(input, ex);
    }
}

module.exports = protocolException;
