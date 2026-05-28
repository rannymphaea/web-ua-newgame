import React from 'react';

type ProfileCardProps = {
  name: string;
  role?: string;
  avatarUrl?: string;
  leading?: React.ReactNode;
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ name, role, avatarUrl, leading, className = '' }) => {
  return (
    <div className={`flex items-center gap-1.5 p-3 rounded-md shadow-sm ${className}`} style={{ background: 'var(--clr-bg-surface-elevated)' }}>
      {leading && <div className="flex items-center mr-2">{leading}</div>}

      <div className="flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
            style={{ border: '1px solid var(--clr-border)' }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: 'linear-gradient(135deg, var(--clr-lavender), var(--clr-ink))', color: 'var(--clr-bg)' }}>
            {getInitials(name)}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center ml-3 min-w-0">
        <div className="text-lg font-semibold leading-tight truncate" style={{ color: 'var(--clr-text-primary)' }}>{name}</div>
        {role && (
          <div className="text-sm font-medium mt-0.5 truncate" style={{ color: 'var(--clr-text-secondary)' }}>{role}</div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
