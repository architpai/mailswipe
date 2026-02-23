import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACTION_PRESETS, COLOR_PALETTE, DEFAULT_SETTINGS, getActionLabel } from '../../hooks/useSettings';

const DIRECTION_CONFIG = [
  { key: 'left',  symbol: '\u2190', label: 'LEFT SWIPE' },
  { key: 'up',    symbol: '\u2191', label: 'UP SWIPE' },
  { key: 'right', symbol: '\u2192', label: 'RIGHT SWIPE' },
];

const ACTION_KEYS = Object.keys(ACTION_PRESETS);

function ActionDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  const currentPreset = ACTION_PRESETS[value];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border-[3px] border-black font-mono font-black text-xs uppercase tracking-tight cursor-pointer hover:bg-black/5 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-4 h-4 flex-none"
            style={{ backgroundColor: currentPreset.defaultColor }}
          />
          {currentPreset.label}
        </span>
        <span className="text-[10px]">{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-10 left-0 right-0 mt-0 bg-white border-[3px] border-black border-t-0"
          >
            {ACTION_KEYS.map((key) => {
              const preset = ACTION_PRESETS[key];
              const isSelected = key === value;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 font-mono font-black text-xs uppercase tracking-tight cursor-pointer border-none transition-colors ${
                    isSelected
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-black/5'
                  }`}
                >
                  <span
                    className="inline-block w-4 h-4 flex-none"
                    style={{ backgroundColor: preset.defaultColor }}
                  />
                  {preset.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_PALETTE.map((color) => {
        const isSelected = value === color.value;
        return (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className="w-7 h-7 cursor-pointer border-none p-0 transition-transform hover:scale-110"
            style={{
              backgroundColor: color.value,
              outline: isSelected ? '3px solid black' : 'none',
              outlineOffset: isSelected ? '2px' : '0',
            }}
            title={color.name}
          />
        );
      })}
    </div>
  );
}

function DirectionSection({ direction, config, onConfigChange }) {
  const handleTypeChange = (newType) => {
    const preset = ACTION_PRESETS[newType];
    const updated = {
      type: newType,
      color: preset.defaultColor,
    };
    if (newType === 'label') {
      updated.labelName = config.labelName || '';
    }
    onConfigChange(updated);
  };

  const handleColorChange = (newColor) => {
    onConfigChange({ ...config, color: newColor });
  };

  const handleLabelNameChange = (e) => {
    const raw = e.target.value;
    const filtered = raw.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 30);
    onConfigChange({ ...config, labelName: filtered });
  };

  return (
    <div className="mb-6">
      <div className="font-black text-sm uppercase tracking-tight mb-3 text-black">
        {direction.symbol} {direction.label}
      </div>

      {/* Action dropdown */}
      <div className="mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-black/50 mb-1">
          ACTION
        </div>
        <ActionDropdown value={config.type} onChange={handleTypeChange} />
      </div>

      {/* Color picker */}
      <div className="mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-black/50 mb-1">
          COLOR
        </div>
        <ColorPicker value={config.color} onChange={handleColorChange} />
      </div>

      {/* Label name input (conditional) */}
      {config.type === 'label' && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-black/50 mb-1">
            LABEL NAME
          </div>
          <input
            type="text"
            value={config.labelName || ''}
            onChange={handleLabelNameChange}
            placeholder="e.g. Important"
            maxLength={30}
            className="w-full px-3 py-2 border-[3px] border-black bg-white font-mono font-bold text-xs uppercase tracking-tight placeholder:text-black/30 focus:outline-none"
          />
          <div className="text-[10px] font-bold uppercase tracking-wider text-black/30 mt-1">
            CREATES: MAILSWIPE/{config.labelName || '<NAME>'}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settings({ settings, onSave, onReset, onClose }) {
  const [draft, setDraft] = useState(() => {
    // Deep clone the swipeActions from current settings
    return JSON.parse(JSON.stringify(settings.swipeActions));
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleDirectionChange = (dirKey, newConfig) => {
    setDraft((prev) => ({
      ...prev,
      [dirKey]: newConfig,
    }));
    setError('');
  };

  const handleSave = () => {
    // Validate: label actions must have a labelName
    for (const dir of DIRECTION_CONFIG) {
      const cfg = draft[dir.key];
      if (cfg.type === 'label' && (!cfg.labelName || cfg.labelName.trim() === '')) {
        setError(`${dir.label} has Custom Label selected but no label name.`);
        return;
      }
    }

    // Validate: no two directions share the same action+label combo
    const combos = DIRECTION_CONFIG.map((dir) => {
      const cfg = draft[dir.key];
      const combo = cfg.type === 'label' ? `label:${cfg.labelName.trim().toLowerCase()}` : cfg.type;
      return { dir: dir.label, combo };
    });
    for (let i = 0; i < combos.length; i++) {
      for (let j = i + 1; j < combos.length; j++) {
        if (combos[i].combo === combos[j].combo) {
          setError(`${combos[i].dir} and ${combos[j].dir} have the same action.`);
          return;
        }
      }
    }

    setError('');
    onSave({ ...settings, swipeActions: draft });
    onClose();
  };

  const handleReset = () => {
    setDraft(JSON.parse(JSON.stringify(DEFAULT_SETTINGS.swipeActions)));
    setError('');
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute inset-0 flex flex-col bg-white sm:mt-16 sm:h-[calc(100vh-4rem)] sm:max-w-md sm:mx-auto border-t-[3px] border-black font-mono"
          style={{ touchAction: 'auto' }}
        >
          {/* Header */}
          <div className="flex-none p-4 flex items-center justify-between bg-white border-b-[3px] border-black">
            <span className="font-black text-sm text-black uppercase tracking-tight">
              SETTINGS
            </span>
            <button
              onClick={onClose}
              className="flex-none text-[#ff0000] font-black text-2xl leading-none hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer font-mono"
            >
              X
            </button>
          </div>

          {/* Body */}
          <div
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-white"
            style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overscrollBehavior: 'contain' }}
          >
            {DIRECTION_CONFIG.map((dir) => (
              <DirectionSection
                key={dir.key}
                direction={dir}
                config={draft[dir.key]}
                onConfigChange={(newConfig) => handleDirectionChange(dir.key, newConfig)}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex-none p-4 pb-8 sm:pb-4 border-t-[3px] border-black bg-white">
            {error && (
              <div className="text-[#dc2626] font-bold text-xs uppercase tracking-tight mb-3">
                {error}
              </div>
            )}
            <button
              onClick={handleSave}
              className="w-full py-3 bg-black text-white font-black border-[3px] border-black font-mono text-xs uppercase tracking-tight cursor-pointer hover:bg-black/80 active:scale-[0.98] transition-all mb-2"
            >
              SAVE & APPLY
            </button>
            <button
              onClick={handleReset}
              className="w-full py-3 bg-white text-black font-black border-[3px] border-black font-mono text-xs uppercase tracking-tight cursor-pointer hover:bg-black/5 active:scale-[0.98] transition-all"
            >
              RESET DEFAULTS
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
