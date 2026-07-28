const Dropdown = ({ 
  label, 
  options, 
  value, 
  onChange, 
  name,
  placeholder = "Select an option", 
  className = "" 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl 
                     focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 
                     appearance-none text-gray-800 dark:text-white cursor-pointer text-sm
                     hover:border-emerald-400 transition-all duration-200"
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-sm">
          ▼
        </div>
      </div>
    </div>
  );
};

export default Dropdown;