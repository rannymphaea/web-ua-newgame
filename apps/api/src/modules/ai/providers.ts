import Groq from "groq-sdk";

export const GroqProvider = {
  provide: 'GROQ_CLIENT',
  useFactory: () => {
    console.log("GROQ_CLIENT: Initialized (Key loaded: " + (process.env.GROQ_API_KEY ? "YES" : "NO") + ")"); // safe check
    return new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  },
};