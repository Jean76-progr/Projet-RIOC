import Dexie, { Table } from 'dexie';
import { Project } from '../types/Element';

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