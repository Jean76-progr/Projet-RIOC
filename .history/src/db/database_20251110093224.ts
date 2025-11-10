import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Project } from '../types/element';
import type { Widget } from '../types/element';

export class EasyFrontDB extends Dexie {
  projects!: Table<Project>;
  widgets!: Table<Widget>;

  constructor() {
    super('EasyFrontDB');
    
    // Version 1 : Projects seulement
    this.version(1).stores({
      projects: 'id, name, createdAt, updatedAt'
    });
    
    // Version 2 : Ajout de widgets
    this.version(2).stores({
      projects: 'id, name, createdAt, updatedAt',
      widgets: 'id, name, category, createdAt'
    });
  }
}

export const db = new EasyFrontDB();

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Widget {
  id: string;
  name: string;
  category: string;
  createdAt: Date;
}