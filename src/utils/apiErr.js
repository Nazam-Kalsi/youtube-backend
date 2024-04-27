class ApiErr extends Error {
    constructor(statusCode, message = "Invalid", errors = [], stack="") {
        super(message);
        this.message = message;
        this.data=null;
        this.statusCode=statusCode;
        this.errors = errors;
        if (stack) {this.stack = stack;} else {Error.captureStackTrace(this, this.constructor)}
    
    }
}

export {ApiErr};