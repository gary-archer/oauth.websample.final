"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpProxy = void 0;
const tunnel_agent_1 = __importDefault(require("tunnel-agent"));
const url_1 = __importDefault(require("url"));
/*
 * Some HTTP libraries require an agent to be expressed in order to see traffic in Fiddler or Charles
 */
class HttpProxy {
    /*
     * Activate debugging if required
     */
    static initialize(useProxy, proxyUrl) {
        if (useProxy) {
            const opts = url_1.default.parse(proxyUrl);
            HttpProxy._agent = tunnel_agent_1.default.httpsOverHttp({
                proxy: opts,
            });
        }
    }
    /*
     * Return the configured agent
     */
    static get() {
        return HttpProxy._agent;
    }
}
exports.HttpProxy = HttpProxy;
