import { Injectable } from '@nestjs/common';
import OpenAI from "openai";

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not defined in environment variables');
      }
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  async generate(prompt: string) {
    try {
      const client = this.getOpenAI();
      const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      return res.choices[0].message.content;
    } catch (err) {
      return `AI error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
}