import React, { useEffect, useRef, useState } from "react";
import { WETH, DEFAULT_VALUE, coinAddresses, getCoinIcon } from "../utils/SupportedCoins";

const TokenIcon = ({ name, size = 6 }) => {
  const icon = getCoinIcon(name);
  if (!icon) return null;
  return (
    <img
      src={icon}
      alt={name}
      className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0`}
    />
  );
};

const Selector = ({ defaultValue, ignoreValue, setToken, id }) => {
  const menu = coinAddresses.map((coin) => ({
    key: coin.name,
    name: coin.name,
    icon: coin.icon,
  }));

  const [selectedItem, setSelectedItem] = useState(defaultValue);
  const [menuItems, setMenuItems] = useState(getFilteredItems(ignoreValue));
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  function getFilteredItems(ignoreValue) {
    if (ignoreValue !== WETH) {
      return menu.filter((item) => item.key !== ignoreValue);
    }
    return menu.filter((item) => item.key !== WETH);
  }

  useEffect(() => {
    setSelectedItem(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    setMenuItems(getFilteredItems(ignoreValue));
  }, [ignoreValue]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDefault = selectedItem === DEFAULT_VALUE;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-semibold text-white transition-colors whitespace-nowrap min-w-[9rem] ${
          isDefault ? "bg-[#840c4a] hover:bg-[#9e1058]" : "bg-[#2c2f36] hover:bg-[#363a45]"
        }`}
      >
        {!isDefault && <TokenIcon name={selectedItem} size={5} />}
        <span className="flex-1 text-left">{selectedItem}</span>
        <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl shadow-xl bg-[#1a1d24] border border-white/10 z-[1000] overflow-hidden">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setSelectedItem(item.key);
                setToken(item.key);
                setOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-200 hover:bg-white/10 transition-colors"
            >
              {item.icon && (
                <img
                  src={item.icon}
                  alt={item.name}
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
              )}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Selector;
