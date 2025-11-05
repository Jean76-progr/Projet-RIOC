export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Arrondit une position complète à la grille
 */
export const snapPositionToGrid = (
  position: { x: number; y: number },
  gridSize: number
): { x: number; y: number } => {
  return {
    x: snapToGrid(position.x, gridSize),
    y: snapToGrid(position.y, gridSize)
  };
};

/**
 * Arrondit une taille à la grille
 */
export const snapSizeToGrid = (
  size: { width: number; height: number },
  gridSize: number
): { width: number; height: number } => {
  return {
    width: Math.max(gridSize, snapToGrid(size.width, gridSize)),
    height: Math.max(gridSize, snapToGrid(size.height, gridSize))
  };
};