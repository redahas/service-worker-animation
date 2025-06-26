interface GridConfig {
  width: number;
  height: number;
  cellSize: number;
  color: string;
}

type CellType = 'empty' | 'sand';

interface Cell {
  type: CellType;
  color: string;
}

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let animationFrameId: number | null = null;
let grid: Cell[][] = [];
let frameCount = 0;
let lastTime = 0;
let config: GridConfig = {
  width: 800,
  height: 600,
  cellSize: 4,
  color: '#e6c619'
};

function initGrid() {
  const cols = Math.floor(config.width / config.cellSize);
  const rows = Math.floor(config.height / config.cellSize);
  
  grid = Array(rows).fill(null).map(() => 
    Array(cols).fill(null).map(() => ({
      type: 'empty',
      color: '#1a1a1a'
    }))
  );

  // Add a test sand particle in the middle
  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);
  grid[centerY][centerX] = {
    type: 'sand',
    color: config.color
  };
  console.log('Added test sand particle at:', centerX, centerY);
}

function drawGrid() {
  if (!ctx || !canvas) {
    console.error('drawGrid: ctx or canvas is null');
    return;
  }

  // Clear the canvas with a solid color
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw cells
  let sandCount = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];
      if (cell.type === 'sand') {
        sandCount++;
        ctx.fillStyle = cell.color;
        ctx.fillRect(
          x * config.cellSize,
          y * config.cellSize,
          config.cellSize,
          config.cellSize
        );
      }
    }
  }

  // Draw debug info
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  ctx.fillText(`Frame: ${frameCount}`, 10, 20);
  ctx.fillText(`FPS: ${Math.round(1000 / (performance.now() - lastTime))}`, 10, 40);
  lastTime = performance.now();
  frameCount++;
}

function updateSand() {
  // Update from bottom to top, right to left
  for (let y = grid.length - 1; y >= 0; y--) {
    for (let x = grid[y].length - 1; x >= 0; x--) {
      if (grid[y][x].type === 'sand') {
        // Try to move down
        if (y < grid.length - 1 && grid[y + 1][x].type === 'empty') {
          grid[y + 1][x] = grid[y][x];
          grid[y][x] = { type: 'empty', color: '#1a1a1a' };
        }
        // Try to move down-left
        else if (y < grid.length - 1 && x > 0 && grid[y + 1][x - 1].type === 'empty') {
          grid[y + 1][x - 1] = grid[y][x];
          grid[y][x] = { type: 'empty', color: '#1a1a1a' };
        }
        // Try to move down-right
        else if (y < grid.length - 1 && x < grid[y].length - 1 && grid[y + 1][x + 1].type === 'empty') {
          grid[y + 1][x + 1] = grid[y][x];
          grid[y][x] = { type: 'empty', color: '#1a1a1a' };
        }
      }
    }
  }
}

function animate() {
  updateSand();
  drawGrid();
  animationFrameId = requestAnimationFrame(animate);
}

function addSand(x: number, y: number) {
  const gridX = Math.floor(x / config.cellSize);
  const gridY = Math.floor(y / config.cellSize);
  
  if (gridY >= 0 && gridY < grid.length && gridX >= 0 && gridX < grid[0].length) {
    grid[gridY][gridX] = {
      type: 'sand',
      color: config.color
    };
  }
}

self.onmessage = (e: MessageEvent) => {
  const { type, data } = e.data;
  console.log('Worker received message:', type);

  switch (type) {
    case 'init':
      console.log('Initializing worker...');
      canvas = data.canvas;
      if (!canvas) {
        console.error('Failed to get canvas');
        return;
      }
      ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Failed to get canvas context');
        return;
      }
      console.log('Canvas and context initialized');
      config = { ...config, ...data.config };
      initGrid();
      console.log('Grid initialized, starting animation');
      lastTime = performance.now();
      frameCount = 0;
      animate();
      self.postMessage({ type: 'initialized' });
      break;

    case 'addSand':
      console.log('Adding sand at:', data.x, data.y);
      addSand(data.x, data.y);
      break;

    case 'updateConfig':
      console.log('Updating config:', data);
      config = { ...config, ...data };
      break;

    case 'stop':
      console.log('Stopping animation');
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      break;
  }
}; 