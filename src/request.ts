import logger from "@divine-lab/logger";
import { colorize } from "@divine-lab/logger/colors";

const GLOBAL_REQUEST_KEY = Symbol.for("divine-lab.request");

type REQUEST_DATA = {
    INITIALIZATION_LOGS: boolean;
    PRINT_ERROR_LEVEL: "none" | "message" | "debug";
    API_LOG: boolean;
    INSTANCE_BASE: string;
};

type REQUEST_STATE = typeof globalThis & { [GLOBAL_REQUEST_KEY]?: REQUEST_DATA };
const requestGlobalState: REQUEST_STATE = globalThis;

if (!requestGlobalState[GLOBAL_REQUEST_KEY]) {
    const INITIALIZATION_LOGS = process.env.DIVINE_LAB_REQUEST_INITIALIZATION_LOGS === "false" ? false : true;
    const PRINT_ERROR_LEVEL = (process.env.DIVINE_LAB_REQUEST_PRINT_ERROR_LEVEL as "none" | "message" | "debug") || "message";
    const API_LOG = process.env.DIVINE_LAB_REQUEST_API_LOG === "false" ? false : true;
    const INSTANCE_BASE = process.env.DIVINE_LAB_REQUEST_INSTANCE_BASE || "";

    if (!["none", "message", "debug"].includes(PRINT_ERROR_LEVEL)) logger.exit(0, `[@divine-lab/request] Invalid ${colorize("orange", "DIVINE_LAB_REQUEST_PRINT_ERROR_LEVEL")}: ${PRINT_ERROR_LEVEL}. Must be one of "none", "message", or "debug".`);

    if (INITIALIZATION_LOGS) {
        logger.raw(`${colorize("cyan", "[@divine-lab/request]")} Initialization in progress...`);
        logger.raw(`${colorize("cyan", "[@divine-lab/request]")} Initialization Logs ${colorize("orange", "DIVINE_LAB_REQUEST_INITIALIZATION_LOGS")}: ${INITIALIZATION_LOGS ? colorize("green", "true") : colorize("red", "false")}${process.env.DIVINE_LAB_REQUEST_INITIALIZATION_LOGS ? "" : colorize("yellow", " (default)")}`);
        logger.raw(`${colorize("cyan", "[@divine-lab/request]")} Print Error Level ${colorize("orange", "DIVINE_LAB_REQUEST_PRINT_ERROR_LEVEL")}: ${PRINT_ERROR_LEVEL ? colorize("green", PRINT_ERROR_LEVEL) : colorize("yellow", "not set")}${process.env.DIVINE_LAB_REQUEST_PRINT_ERROR_LEVEL ? "" : colorize("yellow", " (default)")}`);
        logger.raw(`${colorize("cyan", "[@divine-lab/request]")} API Logs ${colorize("orange", "DIVINE_LAB_REQUEST_API_LOG")}: ${API_LOG ? colorize("green", "true") : colorize("red", "false")}${process.env.DIVINE_LAB_REQUEST_API_LOG ? "" : colorize("yellow", " (default)")}`);
        logger.raw(`${colorize("cyan", "[@divine-lab/request]")} Instance Base ${colorize("orange", "DIVINE_LAB_REQUEST_INSTANCE_BASE")}: ${INSTANCE_BASE ? colorize("green", INSTANCE_BASE) : colorize("yellow", "not set")}${process.env.DIVINE_LAB_REQUEST_INSTANCE_BASE ? "" : colorize("yellow", " (default)")}`);
        logger.raw(`${colorize("cyan", "[@divine-lab/request]")} Initialization complete.`);
    }

    requestGlobalState[GLOBAL_REQUEST_KEY] = {
        INITIALIZATION_LOGS,
        PRINT_ERROR_LEVEL,
        API_LOG,
        INSTANCE_BASE,
    };
}

export default requestGlobalState[GLOBAL_REQUEST_KEY] as REQUEST_DATA;
