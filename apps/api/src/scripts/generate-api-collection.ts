/**
 * NEWGAME API — Postman/Insomnia Collection Generator
 * Run: node apps/api/scripts/generate-api-collection.js
 * Output: api-collection.json (importable ke Postman atau Insomnia)
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

const collection = {
  info: {
    name: 'NEWGAME API v0.1.5',
    description: 'UKM Game Development, Universitas Andalas — Attendance & Member Management Platform',
    version: '0.1.5',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'baseUrl', value: BASE_URL, type: 'string' },
    { key: 'token', value: '', type: 'string', description: 'Firebase ID Token' },
    { key: 'userId', value: '', type: 'string' },
    { key: 'eventId', value: '', type: 'string' },
    { key: 'memberId', value: '', type: 'string' },
  ],
  auth: {
    type: 'bearer',
    bearer: [{ key: 'token', value: '{{token}}', type: 'string' }],
  },
  item: [
    {
      name: 'Auth',
      item: [
        endpoint('POST', 'Verify Member ID', '/auth/verify-member', {
          body: { memberId: 'NG11020001PG', tempPassword: 'TempPass123!' },
        }),
        endpoint('POST', 'Register', '/auth/register', {
          body: { memberId: 'NG11020001PG', email: 'user@example.com', password: 'SecurePass123!' },
        }),
        endpoint('GET', 'Get Me', '/auth/me', { auth: true }),
        endpoint('POST', 'Lookup Member ID', '/auth/lookup-id', {
          body: { memberId: 'NG11020001PG', tempPassword: 'TempPass123!' },
        }),
        endpoint('POST', 'Set Role', '/auth/set-role', {
          auth: true,
          body: { targetUserId: '{{userId}}', newRole: 'member' },
        }),
        endpoint('POST', '2FA Setup', '/auth/2fa/setup', { auth: true }),
        endpoint('POST', '2FA Verify', '/auth/2fa/verify', {
          auth: true, body: { token: '123456' },
        }),
      ],
    },
    {
      name: 'Members',
      item: [
        endpoint('GET', 'List Members', '/members', { auth: true, query: { page: 1, limit: 20, pillar: '', search: '' } }),
        endpoint('GET', 'Member Detail', '/members/{{userId}}', { auth: true }),
        endpoint('POST', 'Create Member', '/members', {
          auth: true,
          body: { memberId: 'NG11020001PG', name: 'Budi Santoso', pillar: 'Game Logic', generation: 'GEN 1' },
        }),
        endpoint('PATCH', 'Update Member', '/members/{{userId}}', {
          auth: true, body: { bio: 'Halo dari NEWGAME!', github: 'https://github.com/user' },
        }),
        endpoint('POST', 'Bulk Import', '/members/import', {
          auth: true,
          body: { members: [{ memberId: 'NG11020001PG', name: 'Budi', email: 'budi@ex.com', pillar: 'Game Logic', tempPassword: 'TempPass!' }] },
        }),
        endpoint('GET', 'Export CSV', '/members/export/csv', { auth: true }),
      ],
    },
    {
      name: 'Attendance',
      item: [
        endpoint('POST', 'Scan QR', '/attendance/scan', {
          auth: true, body: { qrData: '{{eventId}}', userId: '{{userId}}' },
        }),
        endpoint('GET', 'Attendance History', '/attendance/history/{{userId}}', { auth: true }),
        endpoint('POST', 'Manual Input', '/attendance/manual', {
          auth: true, body: { eventId: '{{eventId}}', userId: '{{userId}}', status: 'present' },
        }),
        endpoint('GET', 'Export CSV', '/attendance/export/csv', {
          auth: true, query: { eventId: '', from: '', to: '' },
        }),
      ],
    },
    {
      name: 'Events',
      item: [
        endpoint('GET', 'List Events', '/events', { auth: true }),
        endpoint('POST', 'Create Event', '/events', {
          auth: true,
          body: {
            name: 'Weekly Training', type: 'training', pillar: 'Game Logic',
            date: new Date().toISOString(), duration: 90, location: 'Lab Komputer',
            xpReward: 50, maxParticipants: 30,
          },
        }),
        endpoint('GET', 'Event Detail', '/events/{{eventId}}', { auth: true }),
        endpoint('POST', 'Close Event', '/events/{{eventId}}/close', { auth: true }),
      ],
    },
    {
      name: 'XP',
      item: [
        endpoint('GET', 'Leaderboard', '/xp/leaderboard', { query: { pillar: '', generation: '' } }),
        endpoint('POST', 'Award XP', '/xp/award', {
          auth: true, body: { targetUserId: '{{userId}}', amount: 50, reason: 'Event selesai' },
        }),
        endpoint('GET', 'XP History Export', '/xp/history/export', {
          auth: true, query: { userId: '', from: '', to: '' },
        }),
      ],
    },
    {
      name: 'Notifications',
      item: [
        endpoint('GET', 'My Notifications', '/notifications', { auth: true }),
        endpoint('PATCH', 'Mark Read', '/notifications/{{id}}/read', { auth: true }),
        endpoint('GET', 'Active Broadcasts', '/notifications/broadcasts', { auth: true }),
        endpoint('POST', 'Send to User (admin)', '/notifications/send', {
          auth: true, body: { userId: '{{userId}}', title: 'Test', body: 'Tes notifikasi', type: 'info' },
        }),
        endpoint('POST', 'Broadcast All (admin)', '/notifications/broadcast', {
          auth: true, body: { title: 'Pengumuman Darurat', body: 'Semua anggota harap berkumpul!' },
        }),
      ],
    },
    {
      name: 'Media',
      item: [
        endpoint('GET', 'List Media', '/media', { auth: true, query: { page: 1, limit: 20, usage: '' } }),
        endpoint('POST', 'Upload (base64)', '/media/upload', {
          auth: true, body: { data: 'BASE64_DATA', filename: 'image.jpg', mimeType: 'image/jpeg', usage: 'content' },
        }),
        endpoint('DELETE', 'Delete Media', '/media/{{mediaId}}', { auth: true }),
      ],
    },
    {
      name: 'News',
      item: [
        endpoint('GET', 'Published Articles', '/news/published', { query: { category: '', limit: 20 } }),
        endpoint('GET', 'Article Detail', '/news/{{slug}}', {}),
        endpoint('GET', 'Tutorials', '/news/tutorials', {}),
        endpoint('POST', 'Create Article (admin)', '/news', {
          auth: true, body: { title: 'Judul Artikel', content: 'Konten...', category: 'news', tags: ['gamedev'] },
        }),
      ],
    },
    {
      name: 'Badges',
      item: [
        endpoint('GET', 'Badge Definitions', '/badges', {}),
        endpoint('GET', 'My Badges', '/badges/user/{{userId}}', { auth: true }),
        endpoint('POST', 'Award Badge (admin)', '/badges/award', {
          auth: true, body: { userId: '{{userId}}', badgeId: 'first_attendance' },
        }),
        endpoint('POST', 'Check & Award Auto', '/badges/check/{{userId}}', { auth: true }),
      ],
    },
  ],
};

function endpoint(method: string, name: string, path: string, opts: {
  auth?: boolean; body?: object; query?: object;
}) {
  return {
    name,
    request: {
      method,
      header: [
        { key: 'Content-Type', value: 'application/json' },
        ...(opts.auth ? [{ key: 'Authorization', value: 'Bearer {{token}}' }] : []),
      ],
      url: {
        raw: `{{baseUrl}}${path}${opts.query ? '?' + Object.entries(opts.query).map(([k, v]) => `${k}=${v}`).join('&') : ''}`,
        host: ['{{baseUrl}}'],
        path: path.split('/').filter(Boolean),
        ...(opts.query ? { query: Object.entries(opts.query).map(([k, v]) => ({ key: k, value: String(v) })) } : {}),
      },
      ...(opts.body ? {
        body: {
          mode: 'raw',
          raw: JSON.stringify(opts.body, null, 2),
          options: { raw: { language: 'json' } },
        },
      } : {}),
    },
  };
}

// Write to file
const fs = require('fs');
const path = require('path');
const outPath = path.join(__dirname, '../../../api-collection.json');
fs.writeFileSync(outPath, JSON.stringify(collection, null, 2));
console.log(`✅ API Collection generated: ${outPath}`);
console.log(`   Import ke Postman: File > Import > ${outPath}`);
console.log(`   Import ke Insomnia: Application > Import Data > From File`);
