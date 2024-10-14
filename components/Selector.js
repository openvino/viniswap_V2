import React, { useEffect, useState } from "react";

import { Dropdown } from "@nextui-org/react";
import {
  WETH,
  MTB24,
  DEFAULT_VALUE,
  coinAddresses,
} from "../utils/SupportedCoins";

const Selector = ({ defaultValue, ignoreValue, setToken, id }) => {
  const menu = coinAddresses.map((coin) => ({
    key: coin.name,
    name: coin.name,
  }));

  const [selectedItem, setSelectedItem] = useState();
  const [menuItems, setMenuItems] = useState(getFilteredItems(ignoreValue));

  function getFilteredItems(ignoreValue) {
    return menu.filter((item) => item["key"] !== ignoreValue);
  }

  useEffect(() => {
    setSelectedItem(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    setMenuItems(getFilteredItems(ignoreValue));
  }, [ignoreValue]);

  return (
    <Dropdown>
      <Dropdown.Button
        css={{
          backgroundColor:
            selectedItem === DEFAULT_VALUE ? "#840c4a" : "#2c2f36",
          minWidth: "8rem",
        }}
      >
        {selectedItem}
      </Dropdown.Button>
      <Dropdown.Menu
        aria-label="Dynamic Actions"
        items={menuItems}
        onAction={(key) => {
          setSelectedItem(key);
          setToken(key);
        }}
      >
        {(item) => (
          <Dropdown.Item
            aria-label={id}
            key={item.key}
            color={item.key === "delete" ? "error" : "default"}
          >
            {item.name}
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};
export default Selector;
