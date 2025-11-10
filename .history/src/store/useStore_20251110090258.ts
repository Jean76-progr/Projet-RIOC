import { create } from 'zustand';
import type { Element } from '../types/element';
import { v4 as uuidv4 } from 'uuid';

interface StoreState {
  elements: Element[];
  selectedElementId: string | null;
  
  // Configuration de la grille (toujours active)
  gridSize: number;
  
  // Actions
  addElement: (element: Omit<Element, 'id'>) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  moveElement: (id: string, position: { x: number; y: number }) => void;
  resizeElement: (id: string, size: { width: number; height: number }) => void;
  clearCanvas: () => void;
  setGridSize: (size: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  elements: [],
  selectedElementId: null,
  gridSize: 20,

  addElement: (element) => set((state) => ({
    elements: [...state.elements, { ...element, id: uuidv4() }]
  })),

  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    )
  })),

  deleteElement: (id) => set((state) => ({
    elements: state.elements.filter(el => el.id !== id),
    selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
  })),

  selectElement: (id) => set({ selectedElementId: id }),

  moveElement: (id, position) => set((state) => ({
    elements: state.elements.map(el =>
      el.id === id ? { ...el, position } : el
    )
  })),

  resizeElement: (id, size) => set((state) => ({
    elements: state.elements.map(el =>
      el.id === id ? { ...el, size } : el
    )
  })),

  clearCanvas: () => set({ elements: [], selectedElementId: null }),
  
  setGridSize: (size) => set({ gridSize: size }),
}));