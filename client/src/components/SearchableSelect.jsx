import { useEffect, useMemo, useRef, useState } from 'react';

export default function SearchableSelect({ options, value, onChange, placeholder }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);

  const selectedOption = useMemo(() => options.find((o) => String(o.value) === String(value)), [options, value]);

  useEffect(() => {
    setQuery(selectedOption ? selectedOption.label : '');
  }, [selectedOption]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || (selectedOption && q === selectedOption.label.toLowerCase())) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, selectedOption]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions.length, isOpen]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery(selectedOption ? selectedOption.label : '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption]);

  function selectOption(option) {
    setQuery(option.label);
    setIsOpen(false);
    onChange(option.value);
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const option = filteredOptions[highlightedIndex];
      if (option) selectOption(option);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery(selectedOption ? selectedOption.label : '');
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        value={query}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-orange focus:outline-none"
      />
      {isOpen && (
        <ul role="listbox" className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5">
          {filteredOptions.length === 0 && <li className="px-3 py-1.5 text-sm text-gray-400">Keine Treffer</li>}
          {filteredOptions.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={String(option.value) === String(value)}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(option);
              }}
              className={`cursor-pointer px-3 py-1.5 text-sm ${
                index === highlightedIndex ? 'bg-brand-orange/10 text-brand-navy' : 'text-gray-700'
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
