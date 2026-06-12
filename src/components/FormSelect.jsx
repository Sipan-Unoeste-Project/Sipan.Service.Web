import { Children, isValidElement, useEffect, useRef, useState } from 'react';

function parseOptions(children) {
  return Children.toArray(children)
    .filter((child) => isValidElement(child) && child.type === 'option')
    .map((child, index) => {
      const { value, disabled, children: label } = child.props;
      const labelText =
        typeof label === 'string' || typeof label === 'number'
          ? String(label)
          : Children.toArray(label).join('');
      return {
        value: value !== undefined && value !== null ? String(value) : labelText,
        label: labelText,
        disabled: Boolean(disabled),
        key: `${value ?? labelText}-${index}`,
      };
    });
}

function buildChangeEvent(name, id, value) {
  const target = { name: name ?? '', value, id };
  return { target, currentTarget: target };
}

export default function FormSelect({
  id,
  name,
  value,
  onChange,
  children,
  className = '',
  style,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapRef = useRef(null);
  const options = parseOptions(children);
  const enabledOptions = options.filter((o) => !o.disabled);

  const currentValue = value !== undefined && value !== null ? String(value) : '';
  const selectedOption = options.find((o) => o.value === currentValue);
  const placeholder = options.find((o) => o.value === '');
  const displayLabel = selectedOption?.label ?? placeholder?.label ?? 'Selecione…';

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) setHighlightIndex(-1);
  }, [open]);

  function selectOption(option) {
    if (option.disabled) return;
    onChange?.(buildChangeEvent(name, id, option.value));
    setOpen(false);
  }

  function toggleOpen() {
    if (disabled) return;
    setOpen((prev) => !prev);
  }

  function handleKeyDown(event) {
    if (disabled) return;

    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(true);
        const selectedIdx = enabledOptions.findIndex((o) => o.value === currentValue);
        setHighlightIndex(selectedIdx >= 0 ? selectedIdx : 0);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % enabledOptions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightIndex((prev) => (prev <= 0 ? enabledOptions.length - 1 : prev - 1));
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = enabledOptions[highlightIndex];
      if (option) selectOption(option);
    }
  }

  const isInvalid = className.includes('is-invalid');
  const toggleClassName = className.replace(/\bis-invalid\b/g, '').trim();

  return (
    <div
      ref={wrapRef}
      className={`sipan-select ${open ? 'is-open' : ''} ${isInvalid ? 'is-invalid' : ''}`}
      style={style}
    >
      <button
        type="button"
        id={id}
        className={`form-select sipan-select-toggle ${toggleClassName}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
      >
        <span className="sipan-select-value">{displayLabel}</span>
      </button>

      {open && (
        <ul
          className="sipan-select-menu"
          role="listbox"
          aria-labelledby={id}
        >
          {options.map((option) => {
            const enabledIndex = enabledOptions.indexOf(option);
            const isHighlighted = enabledIndex === highlightIndex;
            const isSelected = option.value === currentValue;

            return (
              <li
                key={option.key}
                role="option"
                aria-selected={isSelected}
                className={[
                  'sipan-select-option',
                  isSelected ? 'is-selected' : '',
                  isHighlighted ? 'is-highlighted' : '',
                  option.disabled ? 'is-disabled' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => {
                  if (!option.disabled && enabledIndex >= 0) {
                    setHighlightIndex(enabledIndex);
                  }
                }}
                onClick={() => selectOption(option)}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
