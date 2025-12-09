import { useState, useRef, useEffect } from "react";

export default function MultiSelectDropdown({ label, values, options, onChange }) {
  const [open, setOpen] = useState(false);
  const refEl = useRef(null);

  // close when clicking outside
  useEffect(() => {
    function outside(e) {
      if (refEl.current && !refEl.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const handleToggle = (opt) => {
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  };

  const labelText = values.length > 0 ? `${label} (${values.length})` : label;

  return (
    <div className="relative" ref={refEl}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={`border border-gray-300 rounded-md px-3 py-1.5 text-xs bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[140px] text-left flex items-center justify-between ${
          values.length > 0 ? "text-gray-900 font-medium" : "text-gray-500"
        }`}
      >
        <span className="truncate">{labelText}</span>
        <svg
          className={`ml-2 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((opt) => (
            <label key={opt} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={values.includes(opt)}
                onChange={() => handleToggle(opt)}
                className="mr-2 h-3 w-3 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
