/**
 * Brutalist Meme Snapshot Capture
 * Grabs the active webcam video frame, stamps the funny Malayalam dialogue,
 * smile type, teeth count, and brutalist borders, and downloads as PNG meme!
 */

export function captureMemeSnapshot(
  video: HTMLVideoElement | null,
  dialogueMl: string,
  smileTypeMl: string,
  teethCount: number,
  smileScore: number
): void {
  if (!video) return;

  const vWidth = video.videoWidth || 640;
  const vHeight = video.videoHeight || 480;

  const canvas = document.createElement('canvas');
  canvas.width = vWidth;
  canvas.height = vHeight + 110; // Extra room for brutalist meme text strip

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw mirrored video frame
  ctx.save();
  ctx.translate(vWidth, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, vWidth, vHeight);
  ctx.restore();

  // Top Stamp Bar
  ctx.fillStyle = '#000000';
  ctx.fillRect(10, 10, 240, 32);
  ctx.strokeStyle = '#FFE500';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 240, 32);

  ctx.fillStyle = '#FFE500';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`CHIRI // ${smileTypeMl.toUpperCase()}`, 20, 31);

  // Teeth Tag
  if (teethCount > 0) {
    ctx.fillStyle = '#FF1E1E';
    ctx.fillRect(vWidth - 140, 10, 130, 32);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`TEETH: ${teethCount}/32`, vWidth - 130, 31);
  }

  // Bottom Meme Strip
  ctx.fillStyle = '#FFE500';
  ctx.fillRect(0, vHeight, vWidth, 110);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.strokeRect(0, vHeight, vWidth, 110);

  // Large bold Malayalam dialogue quote
  ctx.fillStyle = '#000000';
  ctx.font = '900 22px "Noto Sans Malayalam", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`"${dialogueMl}"`, vWidth / 2, vHeight + 48);

  ctx.font = 'bold 11px monospace';
  ctx.fillText(
    `CHIRI METER: ${Math.round(smileScore)}% • പല്ല്: ${teethCount}/32 • ${smileTypeMl}`,
    vWidth / 2,
    vHeight + 85
  );

  // Download Image
  const link = document.createElement('a');
  link.download = `chiri-meme-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
