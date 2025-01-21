import React, { useState, useEffect } from "react";
import Ball from "./ball";
import Controls from "./controls";
import bg from "../assets/background.jpg";

const GameArea = () => {
  const [y, setY] = useState(30);
  const [velocity, setVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [backgroundPosition, setBackgroundPosition] = useState(0);
  const [speed, setSpeed] = useState(2);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const ws = new WebSocket("wss://bounce-websocket.onrender.com");

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received command from WebSocket:", message);

      switch (message.action) {
        case "jump":
          handleJump();
          break;
        case "accelerate":
          handleAccelerate();
          break;
        case "decelerate":
          handleDecelerate();
          break;
        case "reverse":
          handleReverse();
          break;
        default:
          console.warn("Unknown action received:", message.action);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (isJumping) {
      const jumpInterval = setInterval(() => {
        setY((prevY) => {
          const newY = prevY + velocity;
          setVelocity((prevVelocity) => prevVelocity - 1);

          if (newY <= 10) {
            clearInterval(jumpInterval);
            setIsJumping(false);
            setVelocity(0);
            return 10;
          }

          return newY;
        });
      }, 16);

      return () => clearInterval(jumpInterval);
    }
  }, [isJumping, velocity]);

  useEffect(() => {
    const backgroundInterval = setInterval(() => {
      setBackgroundPosition((prev) => prev - speed * direction);
    }, 16);

    return () => clearInterval(backgroundInterval);
  }, [speed, direction]);

  // Controls
  const handleJump = () => {
    if (!isJumping) {
      setIsJumping(true);
      setVelocity(15);
    }
  };

  const handleAccelerate = () => {
    setSpeed((prevSpeed) => Math.min(prevSpeed + 1, 10));
  };

  const handleDecelerate = () => {
    setSpeed((prevSpeed) => Math.max(prevSpeed - 1, 1));
  };

  const handleReverse = () => {
    setDirection((prevDirection) => prevDirection * -1);
  };

  return (
    <div className="relative w-full max-w-[800px] h-[700px] border-2 border-black mx-auto overflow-hidden mt-8 bg-blue-100">
      <div
        className="relative w-full h-[85%] overflow-hidden"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "cover",
          backgroundPosition: `0px ${-20}px`,
          backgroundPositionX: `${backgroundPosition}px`,
        }}
      >
        <Ball y={y} speed={speed * direction} />
      </div>

      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 py-4 bg-gray-200 border-t h-[15%]">
        <Controls
          onJump={handleJump}
          onAccelerate={handleAccelerate}
          onDecelerate={handleDecelerate}
          onReverse={handleReverse}
        />
      </div>
    </div>
  );
};

export default GameArea;
