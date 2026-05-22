import Selector from "./PoolSelector";
import { getCoinIcon } from "../utils/SupportedCoins";

const PoolField = ({ obj, disabled }) => {
  const { id, value, setValue, defaultValue, setToken, ignoreValue } = obj;
  const isEthFixed = defaultValue === "ETH" && !disabled;
  const ethIcon = getCoinIcon("ETH");

  return (
    <div className="flex items-center w-full gap-3 rounded-xl">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-xs text-gray-500 mb-1 px-1">
          {id === "srcToken" ? "Token" : "ETH"}
        </span>
        <input
          className="w-full outline-none h-8 px-1 appearance-none text-3xl bg-transparent"
          type="number"
          value={value}
          placeholder="0.0"
          onChange={setValue ? (e) => setValue(e.target.value) : undefined}
          readOnly={!setValue}
        />
      </div>

      {isEthFixed ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-semibold text-white bg-[#2c2f36] whitespace-nowrap min-w-[9rem]">
          {ethIcon && <img src={ethIcon} alt="ETH" className="w-5 h-5 rounded-full object-cover" />}
          <span>ETH</span>
        </div>
      ) : (
        <Selector
          id={id}
          setToken={setToken}
          defaultValue={defaultValue}
          ignoreValue={ignoreValue?.name || ignoreValue}
        />
      )}
    </div>
  );
};

export default PoolField;
