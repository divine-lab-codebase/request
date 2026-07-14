import { SERVER_ERRORS, type ServerErrorOptions, type ServerErrorKey } from "../errors/BackendErrors.js";
import { type Static, type TObject } from "@sinclair/typebox";
import { type FastifyRequest } from "fastify/types/request.js";
import { type FastifyReply } from "fastify/types/reply.js";
import { colorize } from "@divine-lab/logger/colors";
import { APIError } from "../errors/APIError.js";
import { type FastifyInstance } from "fastify";
import logger from "@divine-lab/logger";

const API_LOG = process.env.DIVINE_LAB_REQUEST_API_LOG === "true";
logger.raw(`${colorize("blue", "[API]")} - API logging is ${API_LOG ? colorize("green", "enabled") : colorize("red", "disabled")} - ${API_LOG ? "API requests and responses will be logged." : `to enable, set ${colorize("yellow", "DIVINE_LAB_REQUEST_API_LOG")}=true in environment variables`}`);
const INSTANCE_BASE = process.env.DIVINE_LAB_REQUEST_INSTANCE_BASE || "";
logger.raw(`${colorize("blue", "[API]")} - API instance base path is set to ${colorize("yellow", INSTANCE_BASE)}. Configure this with the ${colorize("yellow", "DIVINE_LAB_REQUEST_INSTANCE_BASE")} environment variable.`);

type httpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type RateLimitConfig = { max: number; TimeWindow: string; keyGenerator?: (req: FastifyRequest) => string };
/** Type definition for the success response payload.
 * @property {string} title - short, human-readable summary of the response
 * @property {string} detail - detailed description of the response
 * @property {any} data - any additional data to include in the response
 */
type SuccessResponse = {
    title?: string;
    detail?: string;
    data?: any;
};

/** Sends a standardized error response.
 * Uses the RFC 9457 Format.
 * @param res - Fastify reply object
 * @param error - error code or identifier
 * @param options - additional error details (title, detail, type, data)
 * @returns {void}
 * @example
 * ```ts
 * return errorResponse(res, "NOT_FOUND", { title: "Resource Not Found", detail: "The requested resource was not found." });
 * ```
 */
export function errorResponse(res: FastifyReply, error: ServerErrorKey, { title, detail, type, data, status }: ServerErrorOptions = {}): void {
    const errorDef = SERVER_ERRORS[error];
    if (API_LOG) logger.raw(`${new Date().toISOString()} ${colorize("red", "[API]")} - ${colorize("red", (status || errorDef.status) as unknown as string)} - ${colorize("gray", `[${res.request.method}]`)} - ${colorize("gray", res.request.ip)} - ${res.request.url} : ${colorize("gray", `${title || errorDef.title} - ${detail || errorDef.detail}`)}`);
    res.code(status || errorDef.status).send({
        status: status || errorDef.status,
        instance: `${INSTANCE_BASE}${res.request.url}`,
        title: title || errorDef.title,
        detail: detail || errorDef.detail,
        type: type || errorDef.type,
        data: data || null,
    });
}

/** Sends a standardized success response.
 * @param res - Fastify reply object
 * @param status - HTTP status code
 * @param title - short, human-readable summary of the response
 * @param detail - detailed description of the response
 * @param data - any additional data to include in the response
 * @returns {void}
 * @example
 * ```ts
 * return successResponse(res, 200, "User Created", "The user was created successfully, you should recieve an email in a short while.", { id: 1, name: "Example" });
 * ```
 */
export function successResponse(res: FastifyReply, status = 200, { title = "Success", detail = "Success", data = null }: SuccessResponse = { title: "Success", detail: "Success", data: null }): void {
    if (API_LOG) logger.raw(`${new Date().toISOString()} ${colorize("green", "[API]")} - ${colorize("green", status as unknown as string)} - ${colorize("gray", `[${res.request.method}]`)} - ${colorize("gray", res.request.ip)} - ${res.request.url} : ${colorize("gray", title)}`);
    res.code(status).send({
        success: true,
        title,
        detail,
        data,
    });
}

/** Utility function to register a route with standardized request typing and optional schema validation.
 * @param fastify - The Fastify instance to register the route on
 * @param method - HTTP method (e.g., "get", "post")
 * @param path - Route path (e.g., "/users/:id")
 * @param handler - Route handler function with typed request and reply
 * @param options - Optional route options, including schema for validation and pre-handlers
 * @returns void
 * @example
 * ```ts
 * REGISTER_ROUTE(fastify, "post", "/users", async (req, res) => {
 *     const { name, email } = req.body;
 *     // Handle user creation logic here
 *     return successResponse(res, 201, "User created successfully", { id: newUserId });
 * }, {
 *     schema: {
 *         body: Type.Object({
 *             name: Type.String(),
 *             email: Type.String({ format: "email" }),
 *         }),
 *     }, preHandler: async (req, res) => {
 *         // Optional pre-handler logic (e.g., authentication)
 *     }
 * });
 * ```
 */
export function REGISTER_ROUTE<BodyType extends TObject, QueryType extends TObject, ParamsType extends TObject, RateLimitType extends RateLimitConfig | undefined = undefined>(fastify: FastifyInstance, method: httpMethod, path: string, handler: (req: FastifyRequest<{ Body: Static<BodyType>; Querystring: Static<QueryType>; Params: Static<ParamsType>; RateLimit: RateLimitType }>, reply: any) => void, options?: { schema?: { body?: BodyType; querystring?: QueryType; params?: ParamsType }; preHandler?: Array<(req: FastifyRequest, reply: any) => void> | ((req: FastifyRequest, reply: any) => void) } & (RateLimitType extends undefined ? { config?: any } : { config: { rateLimit: RateLimitType } })) {
    fastify[method.toLowerCase() as Lowercase<httpMethod>]<{ Body: Static<BodyType>; Querystring: Static<QueryType>; Params: Static<ParamsType>; RateLimit: RateLimitType }>(path, options || {}, handler);
}

/** Centralized error handler for Fastify.
 * @param error - The error object caught by Fastify
 * @param request - The incoming request object
 * @param reply - The Fastify reply object used to send the response
 * @returns {Promise<void>}
 * @example
 * ```ts
 * fastify.setErrorHandler(globalErrorHandler);
 * ```
 */
export async function globalErrorHandler(error: any, _request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (error instanceof APIError) return errorResponse(reply, error.error, { title: error.title, detail: error.detail, type: error.type, data: error.data, status: error.status });
    if (error.statusCode && error.statusCode === 429) return errorResponse(reply, "TOO_MANY_REQUESTS", { title: "Too Many Requests", detail: "You have sent too many requests in a given amount of time. Please try again later.", data: `Retry in ${error.message.match(/\d+\s+\w+/)?.[0]}`, status: 429 });
    if (error.validation) {
        const data = [];
        for (const err of error.validation) data.push({ property: err.instancePath ? err.instancePath.substring(1) : err.params.missingProperty || "unknown", message: `${error.validationContext} ${err.message}` });
        return errorResponse(reply, "BAD_REQUEST", { detail: "Invalid request data, try again with proper formatting", data: data });
    }
    logger.error(`Error processing request: ${error.message}`);
    return errorResponse(reply, "INTERNAL_SERVER_ERROR", { title: "Internal Server Error", detail: "An unexpected error occurred", type: "about:blank", data: null, status: 500 });
}
