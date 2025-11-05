/**
 * SHARED UNDO/REDO TOOLBAR
 * Przyciski cofnij/powtórz z tooltipami i disabled states
 */

import React from 'react';
import { ArrowCounterClockwise, ArrowClockwise } from '@phosphor-icons/react';

interface UndoRedoToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const UndoRedoToolbar: React.FC<UndoRedoToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Cofnij (Ctrl+Z)"
        className={`p-3 rounded-lg font-bold transition-all ${
          canUndo 
            ? 'bg-sky-100 hover:bg-sky-200 text-sky-700' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <ArrowCounterClockwise size={20} weight="bold" />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Powtórz (Ctrl+Y)"
        className={`p-3 rounded-lg font-bold transition-all ${
          canRedo 
            ? 'bg-sky-100 hover:bg-sky-200 text-sky-700' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        <ArrowClockwise size={20} weight="bold" />
      </button>
    </div>
  );
};
