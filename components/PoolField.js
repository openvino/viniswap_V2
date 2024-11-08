import Selector from "./PoolSelector";

const PoolField = ({ obj, disabled }) => {
	console.log("DISABLED", disabled);

	const { id, value, setValue, defaultValue, setToken, ignoreValue } = obj;
	console.log(defaultValue, "defaultValue", value, "value");

	return (
		<div className="flex items-center rounded-xl">
			<input
				className="w-full outline-none h-8 px-2 appearance-none text-3xl bg-transparent"
				type={"number"}
				value={value}
				placeholder={"0.0"}
			/>
			{defaultValue === "ETH" && !disabled ? (
				"ETH"
			) : (
				<Selector
					id={id}
					setToken={setToken}
					defaultValue={defaultValue}
					ignoreValue={ignoreValue}
				/>
			)}
		</div>
	);
};

export default PoolField;
