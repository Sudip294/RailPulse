import { useEffect, useRef } from 'react';

const Aurora = ({ isDarkMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const blobs = [
      { x: 0.2, y: 0.3, r: 0.5, hue: 220, speed: 0.0008 },
      { x: 0.8, y: 0.7, r: 0.45, hue: 270, speed: 0.0006 },
      { x: 0.5, y: 0.1, r: 0.4, hue: 200, speed: 0.001 },
      { x: 0.1, y: 0.8, r: 0.35, hue: 250, speed: 0.0009 },
    ];

    const draw = () => {
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      blobs.forEach((blob, i) => {
        const px = (blob.x + Math.sin(time * blob.speed + i) * 0.15) * canvas.width;
        const py = (blob.y + Math.cos(time * blob.speed * 0.8 + i) * 0.1) * canvas.height;
        const radius = blob.r * Math.min(canvas.width, canvas.height);

        const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius);

        if (isDarkMode) {
          gradient.addColorStop(0, `hsla(${blob.hue + Math.sin(time * 0.002) * 20}, 80%, 60%, 0.18)`);
          gradient.addColorStop(0.5, `hsla(${blob.hue + 20}, 70%, 50%, 0.08)`);
          gradient.addColorStop(1, `hsla(${blob.hue}, 60%, 40%, 0)`);
        } else {
          gradient.addColorStop(0, `hsla(${blob.hue + Math.sin(time * 0.002) * 20}, 70%, 75%, 0.14)`);
          gradient.addColorStop(0.5, `hsla(${blob.hue + 20}, 60%, 65%, 0.06)`);
          gradient.addColorStop(1, `hsla(${blob.hue}, 50%, 55%, 0)`);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: isDarkMode ? 1 : 0.7 }}
    />
  );
};

export default Aurora;
