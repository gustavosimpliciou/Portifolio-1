import { useEffect, useRef } from "react";

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const SPACING = 20;
    const DOT_RADIUS = 0.9;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    parent.addEventListener("mousemove", onMouseMove);
    parent.addEventListener("mouseleave", onMouseLeave);

    const animate = () => {
      timeRef.current += 0.012;
      const t = timeRef.current;
      const { x: mx, y: my } = mouseRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width / SPACING) + 1;
      const rows = Math.ceil(canvas.height / SPACING) + 1;

      ctx.beginPath();

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const baseX = i * SPACING;
          const baseY = j * SPACING;

          // Layered wave field — creates the undulating tech fiber look
          const wave1 = Math.sin(i * 0.18 + t * 0.7) * 6;
          const wave2 = Math.sin(j * 0.14 + t * 0.5) * 5;
          const wave3 = Math.sin((i * 0.1 + j * 0.08) + t * 1.1) * 3;
          const wave4 = Math.cos(i * 0.07 - j * 0.11 + t * 0.4) * 4;

          let dy = wave1 + wave2 + wave3 + wave4;

          // Mouse ripple — ring wave spreading from cursor
          const dx = baseX - mx;
          const distY = baseY - my;
          const dist = Math.sqrt(dx * dx + distY * distY);
          const ripple =
            Math.sin(dist * 0.07 - t * 5) *
            Math.exp(-dist * 0.006) *
            18;
          dy += ripple;

          const finalY = baseY + dy;

          // Alpha: peaks are slightly brighter, valleys dimmer
          const normWave = (wave1 + wave2) / 11; // -1 to 1
          const alpha = 0.06 + normWave * 0.04 + 0.04;

          ctx.moveTo(baseX + DOT_RADIUS, finalY);
          ctx.arc(baseX, finalY, DOT_RADIUS, 0, Math.PI * 2);
        }
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      parent.removeEventListener("mousemove", onMouseMove);
      parent.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
