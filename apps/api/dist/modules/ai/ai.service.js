"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("openai");
let AiService = class AiService {
    constructor() {
        this.openai = null;
    }
    getOpenAI() {
        if (!this.openai) {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('OPENAI_API_KEY is not defined in environment variables');
            }
            this.openai = new openai_1.default({ apiKey });
        }
        return this.openai;
    }
    async generate(prompt) {
        try {
            const client = this.getOpenAI();
            const res = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
            });
            return res.choices[0].message.content;
        }
        catch (err) {
            return `AI error: ${err instanceof Error ? err.message : String(err)}`;
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map