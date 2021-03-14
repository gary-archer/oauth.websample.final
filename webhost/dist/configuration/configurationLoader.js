"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationLoader = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const process_1 = require("process");
/*
 * A class to load the web host's configuration file
 */
class ConfigurationLoader {
    /*
     * Return JSON data from the configuration file, and adjust if required
     */
    async load() {
        const configurationBuffer = await fs_extra_1.default.readFile('host.config.json');
        const data = JSON.parse(configurationBuffer.toString());
        this._applyRuntimeParameters(data);
        return data;
    }
    /*
     * During development, if we are started with 'npm start localapi', point to the local API
     */
    _applyRuntimeParameters(data) {
        if (process_1.argv.length > 2 && process_1.argv[2].toLowerCase() === 'localapi') {
            data.securityHeaders.contentSecurityPolicyHosts[0] = 'https://api.mycompany.com:444';
        }
    }
}
exports.ConfigurationLoader = ConfigurationLoader;
