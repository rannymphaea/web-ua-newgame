"use client";
import React from 'react';
import ProfileCard from '../../components/ui/ProfileCard';
import ToggleDarkMode from '../../components/ui/ToggleDarkMode';

export default function DevProfilePage() {
  return (
    <div className="min-h-screen bg-background dark:bg-novel-midnight p-6">
      <header className="flex justify-end">
        <div className="flex items-center gap-3">
          <ToggleDarkMode />

          <ProfileCard
            name="ahmadadzanigibran22"
            role="Superadmin"
            leading={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            }
          />
        </div>
      </header>

      <main className="mt-8">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">Preview page: top-right profile + toggle. Use this route to verify visuals.</p>
      </main>
    </div>
  );
}
