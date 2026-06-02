"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqProvider = void 0;
const groq_sdk_1 = require("groq-sdk");
exports.GroqProvider = {
    provide: 'GROQ_CLIENT',
    useFactory: () => {
        console.log("GROQ_CLIENT: Initialized (Key loaded: " + (process.env.GROQ_API_KEY ? "YES" : "NO") + ")");
        return new groq_sdk_1.default({
            apiKey: process.env.GROQ_API_KEY,
        });
    },
};
//# sourceMappingURL=providers.js.map