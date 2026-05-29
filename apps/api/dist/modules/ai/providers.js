"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqProvider = void 0;
const groq_sdk_1 = require("groq-sdk");
exports.GroqProvider = {
    provide: 'GROQ_CLIENT',
    useFactory: () => {
        console.log("GROQ KEY:", process.env.GROQ_API_KEY);
        return new groq_sdk_1.default({
            apiKey: process.env.GROQ_API_KEY,
        });
    },
};
//# sourceMappingURL=providers.js.map