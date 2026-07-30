import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';

const SIZE = 150;
const VIEW_RADIUS = 120;

export default function Minimap() {
  const canvasRef = useRef(null);
  const playerPosition = useSelector((state) => state.game.playerPosition);
  const monsters = useSelector((state) => state.game.monsters);
  const npcs = useSelector((state) => state.game.npcs);
  const itemsOnGround = useSelector((state) => state.game.itemsOnGround);
  const otherPlayers = useSelector((state) => state.game.otherPlayers);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, SIZE, SIZE);

    const px = playerPosition?.x ?? 128;
    const pz = playerPosition?.z ?? 128;

    const inRange = (pos) => {
      const dx = (pos.x - px) / 8;
      const dz = (pos.z - pz) / 8;
      return Math.sqrt(dx * dx + dz * dz) < VIEW_RADIUS / 8;
    };

    const toCanvas = (pos) => {
      const cx = SIZE / 2 + (pos.x - px) / 8;
      const cy = SIZE / 2 + (pos.z - pz) / 8;
      return [cx, cy];
    };

    npcs.forEach((npc) => {
      if (npc.position && inRange(npc.position)) {
        const [cx, cy] = toCanvas(npc.position);
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd700';
        ctx.fill();
      }
    });

    itemsOnGround.forEach((item) => {
      if (item.position && inRange(item.position)) {
        const [cx, cy] = toCanvas(item.position);
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#3498db';
        ctx.fill();
      }
    });

    otherPlayers.forEach((player) => {
      if (player.position && inRange(player.position)) {
        const [cx, cy] = toCanvas(player.position);
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffff';
        ctx.fill();
      }
    });

    monsters.forEach((m) => {
      if (m.position && inRange(m.position)) {
        const [cx, cy] = toCanvas(m.position);
        ctx.beginPath();
        ctx.arc(cx, cy, m.isBoss ? 4 : 3, 0, Math.PI * 2);
        ctx.fillStyle = m.isBoss ? '#ff4444' : '#e74c3c';
        ctx.fill();
      }
    });

    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#27ae60';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [playerPosition, monsters, npcs, itemsOnGround, otherPlayers]);

  return <canvas ref={canvasRef} className="minimap" width={SIZE} height={SIZE} />;
}