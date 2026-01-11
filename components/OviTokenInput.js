 const OviTokenInput = ({ value, onChange }) => {
  const handleChange = (e) => {
    const newValue = e.target.value;

    // Solo permitir números y punto decimal
    if (/^\d*\.?\d*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center rounded-xl">
      <div className="relative">
        <input
          className="w-full outline-none h-8 px-2 appearance-none text-3xl bg-transparent"
          type="text"
          value={value}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default OviTokenInput;