export type ElementType = 
  | 'div' 
  | 'button' 
  | 'input' 
  | 'textarea'
  | 'label'
  | 'h1' | 'h2' | 'h3'
  | 'p'
  | 'img'
  | 'form';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Element {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  content: string;
  styles: React.CSSProperties;
  attributes: Record<string, string>;
  children?: string[];
  parentId?: string;
}

export interface Project {
  id: string;
  name: string;
  elements: Element[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    canvasSize?: Size;
    gridSize?: number;
    theme?: string;
  };
}

export interface Widget {
  id: string;
  name: string;
  category: string;
  html: string;
  css: string;
  defaultSize: { width: number; height: number };
  createdAt: Date;
}