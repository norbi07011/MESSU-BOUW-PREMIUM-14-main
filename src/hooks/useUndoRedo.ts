/**
 * UNDO/REDO SYSTEM - History Stack
 * System cofania/powtarzania zmian (jak Photoshop)
 */

import { useState, useCallback } from 'react';

export interface HistoryEntry<T> {
  state: T;
  timestamp: Date;
  description: string;
}

interface UseUndoRedoOptions<T> {
  maxHistory?: number;
  initialState: T;
}

export function useUndoRedo<T>({ maxHistory = 20, initialState }: UseUndoRedoOptions<T>) {
  const [history, setHistory] = useState<HistoryEntry<T>[]>([
    { state: initialState, timestamp: new Date(), description: 'Stan początkowy' }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Obecny stan - zabezpieczenie przed undefined
  const currentState = history[currentIndex]?.state ?? initialState;

  // Dodaj nowy stan do historii
  const pushState = useCallback((newState: T, description: string) => {
    setHistory(prev => {
      // Usuń wszystko po currentIndex (jeśli coś cofnęliśmy)
      const truncated = prev.slice(0, currentIndex + 1);
      
      // Dodaj nowy stan
      const newHistory = [
        ...truncated,
        { state: newState, timestamp: new Date(), description }
      ];

      // Ogranicz do maxHistory
      const finalHistory = newHistory.length > maxHistory 
        ? newHistory.slice(newHistory.length - maxHistory)
        : newHistory;

      // POPRAWKA: Aktualizuj currentIndex BEZPOŚREDNIO po dodaniu
      setCurrentIndex(finalHistory.length - 1);

      return finalHistory;
    });
  }, [currentIndex, maxHistory]);

  // Cofnij (Undo)
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return true;
    }
    return false;
  }, [currentIndex]);

  // Powtórz (Redo)
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return true;
    }
    return false;
  }, [currentIndex, history.length]);

  // Resetuj historię
  const reset = useCallback((newInitialState: T) => {
    setHistory([{ state: newInitialState, timestamp: new Date(), description: 'Reset' }]);
    setCurrentIndex(0);
  }, []);

  // Czy możemy cofnąć?
  const canUndo = currentIndex > 0;

  // Czy możemy powtórzyć?
  const canRedo = currentIndex < history.length - 1;

  // Przejdź do konkretnego punktu w historii
  const goToHistoryIndex = useCallback((index: number) => {
    if (index >= 0 && index < history.length) {
      setCurrentIndex(index);
      return true;
    }
    return false;
  }, [history.length]);

  return {
    currentState,
    pushState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    history,
    currentIndex,
    goToHistoryIndex
  };
}

// Keyboard shortcuts helper
export function useUndoRedoKeyboard(
  undo: () => boolean,
  redo: () => boolean,
  onSave?: () => void,
  onDuplicate?: () => void,
  onPreview?: () => void
) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+Z - Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    
    // Ctrl+Y lub Ctrl+Shift+Z - Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
    }

    // Ctrl+S - Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave?.();
    }

    // Ctrl+D - Duplicate (first column)
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      onDuplicate?.();
    }

    // Ctrl+P - Preview/Print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      onPreview?.();
    }
  }, [undo, redo, onSave, onDuplicate, onPreview]);

  return { handleKeyDown };
}
