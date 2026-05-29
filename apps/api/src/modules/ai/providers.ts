import Groq from "groq-sdk";

export const GroqProvider = {
  provide: 'GROQ_CLIENT',
  useFactory: () => {
    console.log("GROQ KEY:", process.env.GROQ_API_KEY); // cek apakah terbaca
    return new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  },
};