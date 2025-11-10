import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Project } from '../types/element';
import type { Widget } from '../types/element';

export class EasyFrontDB extends Dexie {
  projects!: Table<Project>;
  widgets!: Table<Widget>;

  constructor() {
    super('EasyFrontDB');
    this.version(1).stores({
      projects: '++id, name, createdAt, updatedAt'
    });
    this.version(2).stores({
      projects: '++id, name, createdAt, updatedAt',
      widgets: '++id, name, category, createdAt'
    });
  }
}

export const db = new EasyFrontDB();