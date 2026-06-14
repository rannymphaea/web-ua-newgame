'use client';
import { useRef } from 'react';

interface ProfileCardDownloadProps {
  name: string;
  memberId: string;
  role: string;
  pillar: string;
  xp: number;
  level: number;
  avatarUrl?: string;
  generation?: string;
}

export default function ProfileCardDownload({
  name, memberId, role, pillar, xp, level, avatarUrl, generation,
}: ProfileCardDownloadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function downloadCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 360;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 600, 360);
    grad.addColorStop(0, '#0f0f1a');
    grad.addColorStop(1, '#1a1040');
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, 600, 360, 24);
    ctx.fill();

    // Gold border
    ctx.strokeStyle = '#f4c430';
    ctx.lineWidth = 2;
    ctx.roundRect(2, 2, 596, 356, 22);
    ctx.stroke();

    // Decorative corner pattern
    ctx.strokeStyle = 'rgba(244,196,48,0.3)';
    ctx.lineWidth = 1;
    ctx.roundRect(12, 12, 576, 336, 16);
    ctx.stroke();

    // Avatar circle
    const avatarX = 80;
    const avatarY = 140;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, 56, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244,196,48,0.15)';
    ctx.fill();
    ctx.strokeStyle = '#f4c430';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Try to load avatar
    if (avatarUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = avatarUrl;
        });
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, 54, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, avatarX - 54, avatarY - 54, 108, 108);
        ctx.restore();
      } catch {
        // Draw initials
        ctx.fillStyle = '#f4c430';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name.charAt(0).toUpperCase(), avatarX, avatarY + 10);
      }
    } else {
      ctx.fillStyle = '#f4c430';
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(name.charAt(0).toUpperCase(), avatarX, avatarY + 10);
    }

    // Platform label
    ctx.fillStyle = '#f4c430';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('NEWGAME', 164, 60);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('UKM Game Development • Universitas Andalas', 164, 76);

    // Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillText(name.length > 22 ? name.substring(0, 22) + '…' : name, 164, 118);

    // Role badge
    ctx.fillStyle = 'rgba(244,196,48,0.15)';
    ctx.roundRect(164, 126, ctx.measureText(role).width + 20, 24, 6);
    ctx.fill();
    ctx.fillStyle = '#f4c430';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(role.toUpperCase(), 174, 143);

    // Member ID
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Member ID', 164, 172);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(memberId, 164, 190);

    // Pillar + Gen
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Pilar', 164, 218);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(`${pillar}${generation ? ` • ${generation}` : ''}`, 164, 236);

    // XP Bar
    const barX = 36;
    const barY = 296;
    const barW = 528;
    const barH = 10;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.roundRect(barX, barY, barW, barH, 5);
    ctx.fill();
    const xpFrac = Math.min((xp % 100) / 100, 1);
    const xpGrad = ctx.createLinearGradient(barX, 0, barX + barW * xpFrac, 0);
    xpGrad.addColorStop(0, '#f4c430');
    xpGrad.addColorStop(1, '#ff9f43');
    ctx.fillStyle = xpGrad;
    ctx.roundRect(barX, barY, barW * xpFrac, barH, 5);
    ctx.fill();

    // XP label
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${xp} XP  |  Level ${level}`, barX, barY - 8);

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('newgame.unand.ac.id', 300, 338);

    // Download
    const link = document.createElement('a');
    link.download = `newgame-card-${memberId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button
        id="btn-download-profile-card"
        className="btn btn-secondary btn-sm btn-depth"
        onClick={downloadCard}
        title="Download profile card sebagai gambar"
      >
        <i className="ri-download-2-line" /> Download Card
      </button>
    </>
  );
}
