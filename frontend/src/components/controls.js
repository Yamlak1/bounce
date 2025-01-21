import React from 'react';

const Controls = ({ onJump, onAccelerate, onDecelerate, onReverse }) => {
  return (
    <>
      <button
        onClick={onJump}
        className="w-full px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
      >
        Jump
      </button>
      <button
        onClick={onAccelerate}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
      >
        Accelerate
      </button>
      <button
        onClick={onDecelerate}
        className="w-full px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600"
      >
        Decelerate
      </button>
      <button
        onClick={onReverse}
        className="w-full px-4 py-2 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600"
      >
        Reverse
      </button>
    </>
  );
};

export default Controls;
