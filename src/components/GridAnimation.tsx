import { useEffect, useRef, useState } from 'react';

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

const defaultConfig: GridConfig = {
  width: 800,
  height: 600,
  cellSize: 4,
  color: '#e6c619',
};

export function GridAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<GridConfig>(defaultConfig);
  const isDrawing = useRef<boolean>(false);
  const grid = useRef<Cell[][]>([]);
  const animationFrameId = useRef<number>(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  // Initialize grid
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = config.width;
    canvas.height = config.height;

    // Initialize grid
    const cols = Math.floor(config.width / config.cellSize);
    const rows = Math.floor(config.height / config.cellSize);
    
    grid.current = Array(rows).fill(null).map(() => 
      Array(cols).fill(null).map(() => ({
        type: 'empty',
        color: '#1a1a1a'
      }))
    );

    // Add test sand particle
    const centerX = Math.floor(cols / 2);
    const centerY = Math.floor(rows / 2);
    grid.current[centerY][centerX] = {
      type: 'sand',
      color: config.color
    };

    // Start animation
    function animate() {
      updateSand();
      if (ctx) {
        drawGrid(ctx);
      }
      animationFrameId.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [config.cellSize, config.height, config.width]);

  function updateSand() {
    const gridData = grid.current;
    // Update from bottom to top, right to left
    for (let y = gridData.length - 1; y >= 0; y--) {
      for (let x = gridData[y].length - 1; x >= 0; x--) {
        if (gridData[y][x].type === 'sand') {
          // Try to move down
          if (y < gridData.length - 1 && gridData[y + 1][x].type === 'empty') {
            gridData[y + 1][x] = gridData[y][x];
            gridData[y][x] = { type: 'empty', color: '#1a1a1a' };
          }
          // Try to move down-left
          else if (y < gridData.length - 1 && x > 0 && gridData[y + 1][x - 1].type === 'empty') {
            gridData[y + 1][x - 1] = gridData[y][x];
            gridData[y][x] = { type: 'empty', color: '#1a1a1a' };
          }
          // Try to move down-right
          else if (y < gridData.length - 1 && x < gridData[y].length - 1 && gridData[y + 1][x + 1].type === 'empty') {
            gridData[y + 1][x + 1] = gridData[y][x];
            gridData[y][x] = { type: 'empty', color: '#1a1a1a' };
          }
        }
      }
    }
  }

  function drawGrid(ctx: CanvasRenderingContext2D) {
    if (!canvasRef.current) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw cells
    const gridData = grid.current;
    for (let y = 0; y < gridData.length; y++) {
      for (let x = 0; x < gridData[y].length; x++) {
        const cell = gridData[y][x];
        if (cell.type === 'sand') {
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
    const now = performance.now();
    const fps = Math.round(1000 / (now - lastTime.current));
    lastTime.current = now;
    frameCount.current++;

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText(`Frame: ${frameCount.current}`, 10, 20);
    ctx.fillText(`FPS: ${fps}`, 10, 40);
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    addSand(e);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    addSand(e);
  };

  const addSand = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.floor((e.clientX - rect.left) / config.cellSize);
    const y = Math.floor((e.clientY - rect.top) / config.cellSize);

    if (y >= 0 && y < grid.current.length && x >= 0 && x < grid.current[0].length) {
      grid.current[y][x] = {
        type: 'sand',
        color: config.color
      };
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => ({
      ...prev,
      color: e.target.value,
    }));
  };

  return (
    <div className="grid-animation">
      <canvas
        ref={canvasRef}
        width={config.width}
        height={config.height}
        style={{
          border: '1px solid #ccc',
          background: '#1a1a1a',
          cursor: 'crosshair',
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      />
      <div className="controls">
        <div>
          <label htmlFor="color">Sand Color:</label>
          <input
            id="color"
            type="color"
            value={config.color}
            onChange={handleColorChange}
          />
        </div>
      </div>
    </div>
  );
} 