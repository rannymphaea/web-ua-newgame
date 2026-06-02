"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBetterAuth = createBetterAuth;
let betterAuth = null;
let prismaAdapter = null;
try {
    const ba = require('better-auth');
    const pa = require('better-auth/adapters/prisma');
    betterAuth = ba.betterAuth;
    prismaAdapter = pa.prismaAdapter;
}
catch {
}
function createBetterAuth(prisma) {
    if (!betterAuth || !prismaAdapter) {
        console.warn('[BetterAuth] Package belum terinstall — jalankan: npm install better-auth');
        return null;
    }
    if (!process.env.BETTER_AUTH_SECRET) {
        console.warn('[BetterAuth] BETTER_AUTH_SECRET tidak ditemukan di env');
        return null;
    }
    return betterAuth({
        database: prismaAdapter(prisma, { provider: 'postgresql' }),
        emailAndPassword: {
            enabled: true,
            minPasswordLength: 8,
            requireEmailVerification: false,
        },
        socialProviders: {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                scope: ['openid', 'profile', 'email'],
            },
        },
        session: {
            expiresIn: 60 * 60 * 24 * 30,
            updateAge: 60 * 60 * 24,
            cookieCache: {
                enabled: true,
                maxAge: 60 * 5,
            },
        },
        rateLimit: {
            window: 900,
            max: 10,
        },
        trustedOrigins: [
            process.env.FRONTEND_URL ?? 'http://localhost:3000',
        ],
        user: {
            additionalFields: {
                role: { type: 'string', defaultValue: 'TRAINEE' },
                nim: { type: 'string', required: false },
                angkatan: { type: 'number', required: false },
                pillar: { type: 'string', required: false },
            },
        },
    });
}
//# sourceMappingURL=better-auth.config.js.map