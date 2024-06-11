import { openDatabase } from './openDatabase.ts';
import { checkDatabaseInitialized } from './checkDatabaseInitialized.ts';
import { initializeDatabase } from '../islands/initializeDatabase.tsx';

export const initializeDatabaseIfNeeded = (
    indexedDB: IDBFactory, dbName: string, dbVersion: number, storeName: string
  ): Promise<IDBDatabase> => {
    return openDatabase(indexedDB, dbName, dbVersion)
      .then((db: IDBDatabase) => {
        return checkDatabaseInitialized(db, storeName).then((isInitialized : boolean) => {
          if (isInitialized) {
            return db;
          } else {
            db.close();
            return initializeDatabase(
              indexedDB,
              dbName,
              dbVersion,
              storeName,
            );
          }
        });
      });
  };