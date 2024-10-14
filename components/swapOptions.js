import React, { useState } from "react";

const SwapOptions = ({ setSlippage, setSwapOptionsOpen }) => {
  const [customSlippage, setCustomSlippage] = useState("");

  const handleSelect = (value) => {
    setSlippage(value);
    setSwapOptionsOpen(false);
  };

  const handleCustomChange = (e) => {
    setCustomSlippage(e.target.value);
    setSlippage(e.target.value);
  };

  return (
    <div className="origin-top-right absolute right-0 mt-2 w-20 rounded-md shadow-lg bg-[#212429] ring-1 ring-black ring-opacity-5 z-[1000]">
      <div className="flex justify-center p-2">
        <p className="text-sm text-gray-200 ">Slippage</p>
      </div>
      <div className="py-1 justify-center">
        <button
          className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-400 w-full text-center"
          onClick={() => handleSelect(5)}
        >
          5%
        </button>
        <button
          className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-400 w-full text-center"
          onClick={() => handleSelect(10)}
        >
          10%
        </button>
        <button
          className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-400 w-full text-center"
          onClick={() => handleSelect(20)}
        >
          20%
        </button>
        <button
          className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-400 w-full text-center"
          onClick={() => handleSelect(50)}
        >
          50%
        </button>
        <div className="px-4 py-2">
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Custom"
            value={customSlippage}
            onChange={handleCustomChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SwapOptions;
