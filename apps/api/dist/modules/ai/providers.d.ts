import Groq from "groq-sdk";
export declare const GroqProvider: {
    provide: string;
    useFactory: () => Groq;
};
