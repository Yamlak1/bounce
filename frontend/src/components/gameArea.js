// import React, { useState, useEffect } from 'react';
// import Ball from './ball';
// import Controls from './controls';
// import bg from "../assets/background.jpg";

// const GameArea = () => {
//   const [y, setY] = useState(30); // Ball's vertical position (start closer to the top)
//   const [velocity, setVelocity] = useState(0); // Ball's vertical velocity
//   const [isJumping, setIsJumping] = useState(false); // Whether the ball is jumping
//   const [backgroundPosition, setBackgroundPosition] = useState(0); // Background position
//   const [speed, setSpeed] = useState(2); // Background speed
//   const [direction, setDirection] = useState(1); // 1 for forward, -1 for reverse

//   // Ball jumping logic
//   useEffect(() => {
//     if (isJumping) {
//       const jumpInterval = setInterval(() => {
//         setY((prevY) => {
//           const newY = prevY + velocity;
//           setVelocity((prevVelocity) => prevVelocity - 1); // Gravity effect

//           if (newY <= 10) { // Ground level
//             clearInterval(jumpInterval);
//             setIsJumping(false);
//             setVelocity(0);
//             return 10; // Ground level
//           }

//           return newY;
//         });
//       }, 16); // ~60fps

//       return () => clearInterval(jumpInterval);
//     }
//   }, [isJumping, velocity]);

//   // Background scrolling logic
//   useEffect(() => {
//     const backgroundInterval = setInterval(() => {
//       setBackgroundPosition((prev) => prev - speed * direction); // Move background based on direction
//     }, 16);

//     return () => clearInterval(backgroundInterval);
//   }, [speed, direction]);

//   // Controls
//   const handleJump = () => {
//     if (!isJumping) {
//       setIsJumping(true);
//       setVelocity(15); // Initial jump velocity
//     }
//   };

//   const handleAccelerate = () => {
//     setSpeed((prevSpeed) => Math.min(prevSpeed + 1, 10)); // Limit max speed
//   };

//   const handleDecelerate = () => {
//     setSpeed((prevSpeed) => Math.max(prevSpeed - 1, 1)); // Limit min speed
//   };

//   const handleReverse = () => {
//     setDirection((prevDirection) => prevDirection * -1); // Toggle direction
//   };

//   return (
//     <div className="relative w-full max-w-[800px] h-[700px] border-2 border-black mx-auto overflow-hidden mt-8 bg-blue-100">
//       {/* Game View */}
//       <div
//         className="relative w-full h-[85%] overflow-hidden"
//         style={{
//           backgroundImage: `url(${bg})`,
//           backgroundRepeat: 'repeat-x',
//           backgroundSize: 'cover',
//           backgroundPosition: `0px ${-20}px`,
//           backgroundPositionX: `${backgroundPosition}px`,
//         }}
//       >
//         <Ball y={y} speed={speed * direction} />
//       </div>

//       {/* Controls */}
//       <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 py-4 bg-gray-200 border-t h-[15%]">
//         <Controls
//           onJump={handleJump}
//           onAccelerate={handleAccelerate}
//           onDecelerate={handleDecelerate}
//           onReverse={handleReverse}
//         />
//       </div>
//     </div>
//   );
// };

// export default GameArea;


import React, { useState, useEffect } from 'react';
import Ball from './ball';
import Controls from './controls';
import bg from "../assets/background.jpg";

const GameArea = () => {
  const [y, setY] = useState(30); // Ball's vertical position (start closer to the top)
  const [velocity, setVelocity] = useState(0); // Ball's vertical velocity
  const [isJumping, setIsJumping] = useState(false); // Whether the ball is jumping
  const [backgroundPosition, setBackgroundPosition] = useState(0); // Background position
  const [speed, setSpeed] = useState(2); // Background speed
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for reverse

  useEffect(() => {
    // Establish WebSocket connection
    const ws = new WebSocket("ws://localhost:8081");

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received command from WebSocket:", message);

      // Handle commands received from WebSocket
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

    // Clean up the WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  // Ball jumping logic
  useEffect(() => {
    if (isJumping) {
      const jumpInterval = setInterval(() => {
        setY((prevY) => {
          const newY = prevY + velocity;
          setVelocity((prevVelocity) => prevVelocity - 1); // Gravity effect

          if (newY <= 10) {
            clearInterval(jumpInterval);
            setIsJumping(false);
            setVelocity(0);
            return 10; // Ground level
          }

          return newY;
        });
      }, 16); // ~60fps

      return () => clearInterval(jumpInterval);
    }
  }, [isJumping, velocity]);

  // Background scrolling logic
  useEffect(() => {
    const backgroundInterval = setInterval(() => {
      setBackgroundPosition((prev) => prev - speed * direction); // Move background based on direction
    }, 16);

    return () => clearInterval(backgroundInterval);
  }, [speed, direction]);

  // Controls
  const handleJump = () => {
    if (!isJumping) {
      setIsJumping(true);
      setVelocity(15); // Initial jump velocity
    }
  };

  const handleAccelerate = () => {
    setSpeed((prevSpeed) => Math.min(prevSpeed + 1, 10)); // Limit max speed
  };

  const handleDecelerate = () => {
    setSpeed((prevSpeed) => Math.max(prevSpeed - 1, 1)); // Limit min speed
  };

  const handleReverse = () => {
    setDirection((prevDirection) => prevDirection * -1); // Toggle direction
  };

  return (
    <div className="relative w-full max-w-[800px] h-[700px] border-2 border-black mx-auto overflow-hidden mt-8 bg-blue-100">
      {/* Game View */}
      <div
        className="relative w-full h-[85%] overflow-hidden"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'cover',
          backgroundPosition: `0px ${-20}px`,
          backgroundPositionX: `${backgroundPosition}px`,
        }}
      >
        <Ball y={y} speed={speed * direction} />
      </div>

      {/* Controls */}
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
