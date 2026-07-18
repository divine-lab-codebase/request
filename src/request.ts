import logger from "@divine-lab/logger";
import { colorize } from "@divine-lab/logger/colors";

const GLOBAL_REQUEST_KEY = Symbol.for("divine-lab.request");

type REQUEST_DATA = {
    INITIALIZATION_LOGS: boolean;
    API_LOG: boolean;
    INSTANCE_BASE: string;
};

type REQUEST_STATE = typeof globalThis & { [GLOBAL_REQUEST_KEY]?: REQUEST_DATA };
const requestGlobalState: REQUEST_STATE = globalThis;

if (!requestGlobalState[GLOBAL_REQUEST_KEY]) {
    const INITIALIZATION_LOGS = process.env.DIVINE_LAB_REQUEST_INITIALIZATION_LOGS === "false" ? false : true;
    const API_LOG = process.env.DIVINE_LAB_REQUEST_API_LOG === "false" ? false : true;
    const INSTANCE_BASE = process.env.DIVINE_LAB_REQUEST_INSTANCE_BASE || "";

    if (INITIALIZATION_LOGS) {
        logger.raw(`${colorize("cyan", "[@divine-lab/request]")} Initialization in progress...`);
        logger.raw(`${colorize("cyan", "[@divine-lab/request]")} Initialization Logs ${colorize("gray", "DIVINE_LAB_REQUEST_INITIALIZATION_LOGS")}: ${INITIALIZATION_LOGS ? colorize("green", "true") : colorize("red", "false")}${process.env.DIVINE_LAB_REQUEST_INITIALIZATION_LOGS ? "" : colorize("yellow", " (default)")}`);
        logger.raw(`${colorize("cyan", "[@divine-lab/request]")} API Logs ${colorize("gray", "DIVINE_LAB_REQUEST_API_LOG")}: ${API_LOG ? colorize("green", "true") : colorize("red", "false")}${process.env.DIVINE_LAB_REQUEST_API_LOG ? "" : colorize("yellow", " (default)")}`);
        logger.raw(`${colorize("cyan", "[@divine-lab/request]")} Instance Base ${colorize("gray", "DIVINE_LAB_REQUEST_INSTANCE_BASE")}: ${INSTANCE_BASE ? colorize("green", INSTANCE_BASE) : colorize("yellow", "not set")}${process.env.DIVINE_LAB_REQUEST_INSTANCE_BASE ? "" : colorize("yellow", " (default)")}`);
        logger.raw(`${colorize("cyan", "[@divine-lab/request]")} Initialization complete.`);
    }

    requestGlobalState[GLOBAL_REQUEST_KEY] = {
        INITIALIZATION_LOGS,
        API_LOG,
        INSTANCE_BASE,
    };
}

export default requestGlobalState[GLOBAL_REQUEST_KEY] as REQUEST_DATA;
