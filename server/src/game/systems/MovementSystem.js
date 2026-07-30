class MovementSystem {
  constructor(world) {
    this.world = world;
  }

  movePlayer(player, targetX, targetY, targetZ) {
    const { MIN_X, MAX_X, MIN_Z, MAX_Z } = this.getMapBounds(player.position.mapId);

    if (targetX < MIN_X || targetX > MAX_X || targetZ < MIN_Z || targetZ > MAX_Z) {
      return { success: false, error: 'Out of map bounds' };
    }

    player.position.x = Math.round(targetX);
    player.position.y = targetY || 0;
    player.position.z = Math.round(targetZ);

    return {
      success: true,
      position: { ...player.position },
    };
  }

  teleportPlayer(player, mapId, x, z) {
    const bounds = this.getMapBounds(mapId);
    if (x < bounds.MIN_X || x > bounds.MAX_X) return false;
    if (z < bounds.MIN_Z || z > bounds.MAX_Z) return false;

    player.position = { mapId, x, y: 0, z };
    return true;
  }

  findPath(startX, startZ, endX, endZ, mapId) {
    const grid = this.world.getGrid?.(mapId);
    const path = this.astar(startX, startZ, endX, endZ, grid);
    return path;
  }

  astar(startX, startZ, endX, endZ, grid) {
    const open = [{ x: startX, z: startZ, g: 0, h: 0, parent: null }];
    const closed = new Set();
    const key = (x, z) => `${x},${z}`;

    while (open.length > 0) {
      open.sort((a, b) => a.g + a.h - (b.g + b.h));
      const current = open.shift();

      if (Math.round(current.x) === Math.round(endX) && Math.round(current.z) === Math.round(endZ)) {
        const path = [];
        let node = current;
        while (node) {
          path.push({ x: node.x, z: node.z });
          node = node.parent;
        }
        return path.reverse();
      }

      closed.add(key(current.x, current.z));

      const neighbors = [
        { x: current.x + 1, z: current.z },
        { x: current.x - 1, z: current.z },
        { x: current.x, z: current.z + 1 },
        { x: current.x, z: current.z - 1 },
      ];

      for (const n of neighbors) {
        if (closed.has(key(n.x, n.z))) continue;
        if (grid && grid[n.x]?.[n.z]?.blocked) continue;

        const g = current.g + 1;
        const h = Math.abs(n.x - endX) + Math.abs(n.z - endZ);
        const existing = open.find((o) => o.x === n.x && o.z === n.z);

        if (existing) {
          if (g < existing.g) {
            existing.g = g;
            existing.parent = current;
          }
        } else {
          open.push({ x: n.x, z: n.z, g, h, parent: current });
        }
      }
    }

    return [];
  }

  getMapBounds(mapId) {
    const bounds = {
      lorencia: { MIN_X: 0, MAX_X: 256, MIN_Z: 0, MAX_Z: 256 },
      dungeon: { MIN_X: 0, MAX_X: 256, MIN_Z: 0, MAX_Z: 256 },
      devias: { MIN_X: 0, MAX_X: 256, MIN_Z: 0, MAX_Z: 256 },
      noria: { MIN_X: 0, MAX_X: 256, MIN_Z: 0, MAX_Z: 256 },
      atlans: { MIN_X: 0, MAX_X: 256, MIN_Z: 0, MAX_Z: 256 },
    };
    return bounds[mapId] || bounds.lorencia;
  }

  isInRange(pos1, pos2, range) {
    const dx = pos1.x - pos2.x;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dz * dz) <= range;
  }
}

module.exports = MovementSystem;