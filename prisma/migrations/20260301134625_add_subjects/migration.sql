-- CreateTable
CREATE TABLE "Subject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "year" TEXT NOT NULL,
    "folder_name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "telegram_file_id" TEXT NOT NULL,
    "subject_tag" TEXT NOT NULL DEFAULT '',
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Document" ("course", "file_name", "folder_name", "id", "semester", "telegram_file_id", "uploadedAt", "year") SELECT "course", "file_name", "folder_name", "id", "semester", "telegram_file_id", "uploadedAt", "year" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
