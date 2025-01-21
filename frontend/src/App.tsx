import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const App: React.FC = () => {
  const [speed, setSpeed] = useState(2);
  const [direction, setDirection] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Ball movement
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let dx = speed * direction;
    let dy = speed;

    const drawBall = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
    };

    const update = () => {
      if (x + dx > canvas.width || x + dx < 0) dx = -dx;
      if (y + dy > canvas.height || y + dy < 0) dy = -dy;
      x += dx;
      y += dy;
    };

    let animationFrameId: number;

    const render = () => {
      update();
      drawBall();
      animationFrameId = requestAnimationFrame(render); // Request next frame
    };

    render();

    // Cleanup function to cancel the animation
    return () => cancelAnimationFrame(animationFrameId);
  }, [speed, direction]);

  // WebSocket setup
  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8080");
    const socket = socketRef.current;

    socket.onmessage = (event) => {
      const { action } = JSON.parse(event.data);
      if (action === "speed_up") setSpeed((prev) => prev + 1);
      else if (action === "slow_down")
        setSpeed((prev) => Math.max(1, prev - 1));
      else if (action === "reverse") setDirection((prev) => -prev);
    };

    return () => socket.close();
  }, []);

  return (
    <div className="App">
      <canvas ref={canvasRef} width={500} height={300}></canvas>
      <div>
        <button onClick={() => setSpeed((prev) => prev + 1)}>Speed Up</button>
        <button onClick={() => setSpeed((prev) => Math.max(1, prev - 1))}>
          Slow Down
        </button>
        <button onClick={() => setDirection((prev) => -prev)}>Reverse</button>
      </div>
    </div>
  );
};

export default App;
