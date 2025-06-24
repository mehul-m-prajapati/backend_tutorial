class ApiError extends Error {
    constructor (
        statusCode,                    // HTTP status code (e.g., 400, 404, 500)
        message = "Something went wrong", // Default message if none is provided
        errors = [],                   // Optional list of sub-errors (e.g., validation errors)
        stack = "",                    // Optional custom stack trace
    ) {
        super(message);                // Calls the Error constructor, sets this.message & this.stack
        this.statusCode = statusCode; // Custom: HTTP status
        this.data = null;             // Custom: Optional payload or result (null by default)
        this.message = message;       // Explicitly setting again (optional, but common)
        this.success = false;         // Custom: Flags that the API call failed
        this.errors = errors;         // Custom: Array of error details

        // Custom stack trace (useful for preserving stack in re-thrown errors)
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor); // Clean stack trace
        }
    }
}
