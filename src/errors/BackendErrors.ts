/** Defines standardized server error responses based on RFC 9457.
 * Each error includes a status code, type, title, and detail message.
 * These can be used throughout the application for consistent error handling and responses.
 * Additional errors can be added to the SERVER_ERRORS object as needed.
 */
export const SERVER_ERRORS = {
    INTERNAL_SERVER_ERROR: {
        status: 500,
        type: "about:blank",
        title: "Internal Server Error",
        detail: "An unexpected error occurred on the server.",
    },
    SERVICE_UNAVAILABLE: {
        status: 503,
        type: "about:blank",
        title: "Service Unavailable",
        detail: "The server is currently unable to handle the request due to temporary overload or maintenance.",
    },
    UNKNOWN_ERROR: {
        status: 520,
        type: "about:blank",
        title: "Unknown Error",
        detail: "An unknown error occurred.",
    },
    BAD_REQUEST: {
        status: 400,
        type: "about:blank",
        title: "Bad Request",
        detail: "The server could not understand the request due to invalid syntax.",
    },
    UNAUTHORIZED: {
        status: 401,
        type: "about:blank",
        title: "Unauthorized",
        detail: "The client must authenticate itself to get the requested response.",
    },
    FORBIDDEN: {
        status: 403,
        type: "about:blank",
        title: "Forbidden",
        detail: "The client does not have access rights to the content.",
    },
    NOT_FOUND: {
        status: 404,
        type: "about:blank",
        title: "Not Found",
        detail: "The server can not find the requested resource.",
    },
    CONFLICT: {
        status: 409,
        type: "about:blank",
        title: "Conflict",
        detail: "The request conflicts with the current state of the server.",
    },
    UNSUPPORTED_MEDIA_TYPE: {
        status: 415,
        type: "about:blank",
        title: "Unsupported Media Type",
        detail: "The request has an unsupported media type.",
    },
    TOO_MANY_REQUESTS: {
        status: 429,
        type: "about:blank",
        title: "Too Many Requests",
        detail: "The user has sent too many requests in a given amount of time.",
    },
} as const;

export type ServerErrorKey = keyof typeof SERVER_ERRORS;
export type ServerErrorOptions = {
    status?: number;
    title?: string;
    detail?: string;
    type?: string;
    data?: any;
};
