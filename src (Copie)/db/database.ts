import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Project } from '../types/element';

export class EasyFrontDB extends Dexie {
  projects!: Table<Project>;

  constructor() {
    super('EasyFrontDB');
    this.version(1).stores({
      projects: '++id, name, createdAt, updatedAt'
    });
  }
}

export const db = new EasyFrontDB();