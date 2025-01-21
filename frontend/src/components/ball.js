import React from 'react';

const Ball = ({ y, speed }) => {
  return (
    <div
      className="absolute w-8 h-8 bg-red-500 rounded-full"
      style={{
        left: '5%', // Center horizontally
        transform: `translateX(-50%) rotate(${speed * 10}deg)`, // Rotate based on speed and direction
        bottom: `${y + 140}px`, // Ball's height above ground
        transition: 'transform 0.1s linear', // Smooth rotation
      }}
    ></div>
  );
};

export default Ball;
