import React, { useEffect, useRef } from 'react';

const confettiColors = [
  '#2dd4bf', // teal-400
  '#60a5fa', // blue-400
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#a855f7', // purple-500
  '#facc15', // yellow-400
];

const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: any[] = [];
    const particleCount = 200;

    const createParticles = () => {
        particles.length = 0;
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height - height,
            w: 10,
            h: Math.random() * 10 + 5,
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * Math.PI * 2,
            tilt: Math.random() * 10 - 5,
            tiltAngle: 0,
            tiltAngleIncrement: Math.random() * 0.07 + 0.05,
          });
        }
    }
    
    createParticles();

    let animationFrameId: number;
    const animate = () => {
      if(!ctx) return;
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y += p.speed;
        p.tiltAngle += p.tiltAngleIncrement;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle) * 15;

        if (p.y > height) {
          p.x = Math.random() * width;
          p.y = -20;
        }

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.tilt * Math.PI / 180);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const resizeHandler = () => {
      if (!canvasRef.current) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      createParticles();
    };
    
    window.addEventListener('resize', resizeHandler);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-[55]" />;
};

export default Confetti;