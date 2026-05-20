import * as SQLite from "expo-sqlite";

export const sqliteDb = SQLite.openDatabaseSync("fieldreportx.db");

// Runs once at module load — idempotent, safe to call on every app start.
sqliteDb.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
        uid                TEXT PRIMARY KEY,
        displayName        TEXT NOT NULL,
        email              TEXT NOT NULL,
        organisationId     TEXT,
        role               TEXT NOT NULL DEFAULT 'inspector',
        onboardingComplete INTEGER NOT NULL DEFAULT 0,
        createdAt          INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS organisations (
        id         TEXT PRIMARY KEY,
        name       TEXT NOT NULL,
        abn        TEXT NOT NULL,
        address    TEXT NOT NULL,
        adminUid   TEXT NOT NULL,
        memberUids TEXT NOT NULL,
        createdAt  INTEGER NOT NULL
    );
`);
