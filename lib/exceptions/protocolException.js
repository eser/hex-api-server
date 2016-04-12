/**
 * hex-api-server
 *
 * @version v0.2.0
 * @link http://hexajans.com
 */
"use strict";

class protocolException {
    constructor(input) {
        let exception = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

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