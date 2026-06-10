export function drawTowerPreview(ctx, typeId, w, h, offsetY = 0) {
  const cx = w / 2, cy = h / 2 + offsetY;
  ctx.clearRect(0, 0, w, h);
  switch (typeId) {
    case 'CANNON': {
      ctx.fillStyle = '#4a4a5a'; ctx.fillRect(cx - 11, cy - 3, 22, 10);
      ctx.fillStyle = '#5a5a6a'; ctx.fillRect(cx - 9, cy - 5, 18, 8);
      ctx.fillStyle = '#888';
      for (let i = -8; i <= 8; i += 8) { ctx.fillRect(cx + i - 2, cy - 9, 4, 5); }
      ctx.fillStyle = '#555'; ctx.fillRect(cx - 1, cy - 2, 14, 4);
      ctx.fillStyle = '#333'; ctx.fillRect(cx + 11, cy - 3, 4, 6);
      break;
    }
    case 'MACHINE': {
      ctx.fillStyle = '#6a6a3a'; ctx.fillRect(cx - 14, cy - 2, 28, 10);
      ctx.fillStyle = '#888'; ctx.fillRect(cx - 2, cy - 8, 3, 6); ctx.fillRect(cx + 4, cy - 8, 3, 6);
      ctx.fillStyle = '#666'; ctx.fillRect(cx, cy - 10, 12, 3); ctx.fillRect(cx, cy + 7, 12, 3);
      ctx.fillStyle = '#222'; ctx.fillRect(cx + 10, cy - 11, 3, 5); ctx.fillRect(cx + 10, cy + 6, 3, 5);
      break;
    }
    case 'MORTAR': {
      ctx.fillStyle = '#6a4a3a'; ctx.beginPath(); ctx.arc(cx, cy + 2, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#555'; ctx.fillRect(cx - 3, cy - 6, 6, 10);
      ctx.fillStyle = '#666'; ctx.fillRect(cx - 2, cy - 8, 4, 3);
      ctx.fillStyle = '#333'; ctx.fillRect(cx - 4, cy - 10, 8, 3);
      break;
    }
    case 'SLOW': {
      ctx.fillStyle = '#4488aa'; ctx.beginPath();
      ctx.moveTo(cx, cy - 11); ctx.lineTo(cx - 10, cy + 4); ctx.lineTo(cx + 10, cy + 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#66bbdd'; ctx.beginPath();
      ctx.moveTo(cx, cy - 7); ctx.lineTo(cx - 7, cy + 2); ctx.lineTo(cx + 7, cy + 2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#ccffff'; ctx.lineWidth = 1;
      for (let a = 0; a < 6; a++) {
        const ang = a * Math.PI / 3; ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * 2, cy - 11 + Math.sin(ang) * 2);
        ctx.lineTo(cx + Math.cos(ang) * 5, cy - 11 + Math.sin(ang) * 5); ctx.stroke();
      }
      break;
    }
    case 'ELECTRIC': {
      ctx.fillStyle = '#444466'; ctx.fillRect(cx - 4, cy - 11, 8, 18);
      ctx.fillStyle = '#6666aa'; ctx.fillRect(cx - 2, cy - 9, 4, 14);
      ctx.strokeStyle = '#cc8844'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(cx, cy - 7 + i * 5, 6, 2, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = '#9944dd'; ctx.beginPath(); ctx.arc(cx, cy - 13, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a3a5a'; ctx.fillRect(cx - 10, cy + 7, 20, 4);
      break;
    }
    case 'SNIPER': {
      ctx.fillStyle = '#3a3a4a'; ctx.fillRect(cx - 12, cy + 1, 24, 4);
      ctx.fillStyle = '#4a4a5a'; ctx.fillRect(cx - 10, cy - 1, 20, 4);
      ctx.fillStyle = '#555'; ctx.fillRect(cx - 1, cy - 3, 24, 4);
      ctx.fillStyle = '#666'; ctx.fillRect(cx + 2, cy - 2, 20, 2);
      ctx.fillStyle = '#1a1a2a'; ctx.fillRect(cx + 20, cy - 4, 4, 6);
      ctx.fillStyle = '#aaccff'; ctx.fillRect(cx + 8, cy - 4, 6, 8);
      ctx.strokeStyle = '#3a3a4a'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx - 2, cy + 1); ctx.lineTo(cx - 6, cy + 8);
      ctx.moveTo(cx + 2, cy + 1); ctx.lineTo(cx + 6, cy + 8); ctx.stroke();
      break;
    }
    case 'FLAMETHROWER': {
      ctx.fillStyle = '#5a3a2a'; ctx.beginPath(); ctx.arc(cx - 4, cy + 2, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#444'; ctx.fillRect(cx - 1, cy - 2, 12, 5);
      ctx.fillStyle = '#666'; ctx.fillRect(cx + 9, cy - 3, 4, 7);
      ctx.fillStyle = '#222'; ctx.fillRect(cx + 11, cy - 4, 3, 9);
      ctx.fillStyle = '#ff6600'; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(cx + 15, cy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case 'OBSERVATION': {
      ctx.fillStyle = '#4a5a6a'; ctx.fillRect(cx - 2, cy - 13, 4, 22);
      ctx.fillStyle = '#5a6a7a'; ctx.fillRect(cx - 6, cy + 3, 12, 4); ctx.fillRect(cx - 8, cy - 13, 16, 4);
      ctx.fillStyle = '#88aacc'; ctx.fillRect(cx - 1, cy - 15, 3, 3);
      ctx.fillStyle = '#667';
      for (let i = 0; i < 2; i++) { ctx.fillRect(cx - 7, cy - 6 + i * 6, 14, 2); }
      ctx.fillStyle = '#aaccee'; ctx.beginPath(); ctx.arc(cx, cy - 15, 2, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'ARC': {
      ctx.fillStyle = '#2a4a44'; ctx.fillRect(cx - 4, cy - 10, 8, 18);
      ctx.fillStyle = '#3a6a5a'; ctx.fillRect(cx - 2, cy - 8, 4, 14);
      ctx.strokeStyle = '#44ffcc'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(cx, cy - 6 + i * 5, 6, 2, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = '#44ffcc'; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(cx, cy - 12, 4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case 'INSECTICIDE': {
      ctx.fillStyle = '#2a4a2a'; ctx.fillRect(cx - 10, cy - 5, 20, 12);
      ctx.fillStyle = '#3a6a3a'; ctx.fillRect(cx - 8, cy - 7, 16, 10);
      ctx.fillStyle = '#44ff44'; ctx.fillRect(cx - 6, cy - 3, 6, 4);
      ctx.fillStyle = '#444'; ctx.fillRect(cx + 4, cy - 2, 10, 4);
      ctx.fillStyle = '#666'; ctx.fillRect(cx + 12, cy - 3, 3, 6);
      ctx.fillStyle = '#222'; ctx.fillRect(cx + 13, cy - 4, 2, 8);
      break;
    }
  }
}
