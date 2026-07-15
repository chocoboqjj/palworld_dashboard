export const LAND_SCAPE = [349400, 724400, -1099400, -724400] as const;

const WORLD_X_SPAN = LAND_SCAPE[0] - LAND_SCAPE[2];
const WORLD_Y_SPAN = LAND_SCAPE[1] - LAND_SCAPE[3];

export function toPercent(x: number, y: number): { left: number; top: number } {
  const [mx, my] = toMapPosition(x, y);
  return {
    left: (my / 256) * 100,
    top: (-mx / 256) * 100,
  };
}

export function hasValidLocation(x?: number, y?: number): boolean {
  if (x == null || y == null || isNaN(x) || isNaN(y)) return false;
  if (x === 0 && y === 0) return false;
  return true;
}

export function toMapPosition(x: number, y: number): [number, number] {
  if (x >= -256 && x <= 256) return [x, y];
  const mapX = -256 + (256 * (x - LAND_SCAPE[2])) / WORLD_X_SPAN;
  const mapY = (256 * (y - LAND_SCAPE[3])) / WORLD_Y_SPAN;
  return [mapX, mapY];
}
