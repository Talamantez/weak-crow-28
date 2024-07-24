import { openDatabase } from './openDatabase.ts';
import { checkDatabaseInitialized } from './checkDatabaseInitialized.ts';
import { initializeDatabase } from './initializeDatabase.ts';

// Import the VERSION_STORE_NAME from your versionManagement.ts file
import { VERSION_STORE_NAME } from './versionManagement.ts';

export const initializeDatabaseIfNeeded = (
    indexedDB: IDBFactory, dbName: string, dbVersion: number, storeName: string
  ): Promise<IDBDatabase> => {
    return openDatabase(indexedDB, dbName, dbVersion)
      .then((db: IDBDatabase) => {
        return checkDatabaseInitialized(db, storeName).then((isInitialized : boolean) => {
          if (isInitialized && db.objectStoreNames.contains(VERSION_STORE_NAME)) {
            return db;
          } else {
            db.close();
            return initializeDatabase(
              indexedDB,
              dbName,
              dbVersion,
              storeName,
              VERSION_STORE_NAME
            );
          }
        });
      });
  };