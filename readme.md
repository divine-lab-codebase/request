# @divine-lab/request

Simple http request formatting utility for backends.
Works with <a href="https://fastify.dev/">fastify</a>

### Request Formating

Provides 2 functions for request formating.

1. `successResponse`: for successs responses.
2. `errorResponse`: for error responses.

success response and error response both follow a defined standard.
These functions are defined to be used with fastify for now.

```ts
import { successResponse } from "@divine-lab/request/fastify-helpers";

// Mock type
type SuccessResponse = {
    success: boolean;
    title: string;
    detail: string;
    data: any;
};

// Example of a success response:
const userCreatedResponse: SuccessResponse = {
    success: true,
    title: "Account created successfully",
    detail: "You will recieve a email confirming the account creation in a 5-10 minutes.",
    data: { id: 1, name: "user", age: 21 },
};

// Example success response
successResponse(res, 200, userCreatedResponse);
```

```ts
import { errorResponse } from "@divine-lab/request/fastify-helpers";

// Mock type
type ErrorResponse = {
    status: number;
    title: string;
    detail: string;
    type: string;
    instance: string;
    data: any;
};

// Example of Error Response
const userNotFoundError: ErrorResponse = {
    status: 404,
    title: "User Not Found",
    detail: "The User with the user id '1' not found in our database, please contact customer support if this is a mistake.",
    type: "http://example-errors.com/404/user-not-found",
    instance: "/users/1",
    data: null,
};

// example error response
errorResponse(res, "UNKNOWN", userNotFoundError);
```

Note: RFC9457 requires error responses to contain `instance` in the response. Right now all error responses automatically attach the request url as the instance.

### Errors

Provides an APIError class which can be used to throw standardized Errors.
Uses the defined `ServerErrors` to provide template for errors.

```ts
import APIError from "@divine-lab/request/erros";

async function reqHandler(req, res) {
    // ...
    if (!user) throw new APIError("UNAUTHORIZED");
    // ...
}
```

Note: If a type of error is not defined, You can request for it to be added. Or you can use the `unknown` error and define the options.

```ts
import APIError from "@divine-lab/request/erros";

async function reqHandler(req, res) {
    // ...
    if (unknown) throw new APIError("UNKNOWN", { status: 500, title: "Error", details: "This error was not defined", type: "", data: "" });
    // ...
}
```

### Global Error Handler

In Fastify, you can attach a global error handler to make sure that any error can be caught in it.
To always send standardized error responses, It is recommended to register the global error handler in fastify.

```ts
import { globalErrorHandler } from "@divine-lab/request/fastify-helpers";

// ...
fastify.setErrorHandler(globalErrorHandler);
// ...
```

It automatically formats unknown error into `Internal Server Error`.
Additionally if a `400 Bad request` is made, then this handler should handle it as well.

### Environment Variables

- Supports API response logging via <a>`@divine-lab/logger`</a>.
  Enable by setting ENV Variable `DIVINE_LAB_REQUEST_API_LOG` to `true`.
- Supports base path for `instance` property of error responses via `DIVINE_LAB_REQUEST_INSTANCE_BASE`,
  Defaults to empty string.
- `DIVINE_LAB_REQUEST_PRINT_ERROR_LEVEL`: Specified how to print a Non-APIError error in the global error handler. values -> "none" (does not display anything) | "message" -> (displays error.message when it is a Un-handled error) | "debug" -> (prints all non APIError errors in full regardless it is handled or not). default: "message"

#### Updates:

- 1.1.0: added rate limit error response in backend errors and handling it in global error handler (when using `@fastify/rate-limit`)
- 1.1.1: fixed data response for the rate-limit in global error handler for fastify.
- 1.2.0: added support for instance base path in error responses via environment variable.
- 1.3.0: added support for rate-limiting when registering routes in the REGISTER_ROUTE function.
- 2.1.0: upgrade to fastify 5.11.0, npm audit fix for security patches, added http `query` method to REGISTER_ROUTE function.
- 2.1.1: dependency update: upgrade to @divine-lab/logger 3.0.3
- 2.2.1: Added env variables to debug application error response (not including APIErrors).

#### Contact:

- mail: <a href="mailto:ishpreet@appshala.com">ishpreet@appshala.com<a>
