import { SERVER_ERRORS, type ServerErrorOptions, type ServerErrorKey } from "../errors/BackendErrors.js";

/** Custom API Error class for standardized error handling
 * @extends Error
 * @example
 * ```ts
 * throw new APIError("NOT_FOUND", { title: "Resource Not Found", detail: "The requested resource was not found." });
 * ```
 */
export class APIError extends Error {
    public readonly error: ServerErrorKey;
    public readonly status: number;
    public readonly title: string;
    public readonly detail: string;
    public readonly type: string;
    public readonly data: any;

    /**
     * Creates an instance of APIError.
     * @param error - error code or identifier from SERVER_ERRORS
     * @param options - additional error details (title, detail, type, data)
     * @example
     * ```ts
     * throw new APIError("NOT_FOUND", { title: "Resource Not Found", detail: "The requested resource was not found." });
     * ```
     */
    constructor(error: ServerErrorKey, { title, detail, type, data, status }: ServerErrorOptions = {}) {
        const errorDef = SERVER_ERRORS[error];

        super(title);

        this.error = error;
        this.status = status || errorDef.status;
        this.title = title || errorDef.title;
        this.detail = detail || errorDef.detail;
        this.type = type || errorDef.type;
        this.data = data || null;

        Object.setPrototypeOf(this, APIError.prototype);
    }
}
