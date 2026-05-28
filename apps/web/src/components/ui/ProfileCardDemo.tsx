import React from 'react';
import ProfileCard from './ProfileCard';
import ToggleDarkMode from './ToggleDarkMode';

export const ProfileCardDemo: React.FC = () => {
  return (
    <div className="p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <div />
        <ToggleDarkMode />
      </div>

      <ProfileCard name="ahmadadzanigibran22" role="Superadmin" />
    </div>
  );
};

export default ProfileCardDemo;
