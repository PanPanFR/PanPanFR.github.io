import React, { useRef, useEffect } from 'react';

type CanvasStrokeStyle = string | CanvasGradient | CanvasPattern;

interface GridOffset {
  x: number;
  y: number;
}

interface SquaresProps {
  className?: string;
  speed?: number;
  direction?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'right' | 'left' | 'up' | 'down' | 'diagonal';
  borderColor?: CanvasStrokeStyle;
  squareSize?: number;
}

const Squares: React.FC<SquaresProps> = ({
  className = '',
  speed = 0.5,
  direction = 'top-left',
  borderColor = '#999',
  squareSize = 40
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const numSquaresX = useRef<number>(0);
  const numSquaresY = useRef<number>(0);
  const gridOffset = useRef<GridOffset>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1;
      numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle radial gradient overlay
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)'); // Very subtle opacity

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.current.x % squareSize);
          const squareY = y - (gridOffset.current.y % squareSize);

          ctx.strokeStyle = borderColor;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
        }
      }
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case 'top-left':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        case 'top-right':
          gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize;
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        case 'bottom-left':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize;
          break;
        case 'bottom-right':
          gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize;
          gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize;
          break;
        case 'right':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          break;
        case 'left':
          gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize;
          break;
        case 'up':
          gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize;
          break;
        case 'down':
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        case 'diagonal':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        default:
          // Default to top-left movement
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
      }

      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [direction, speed, borderColor, squareSize]);

  return <canvas ref={canvasRef} className={`w-full h-full border-none block ${className}`}></canvas>;
};

export default Squares;