-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "bgColor" TEXT NOT NULL DEFAULT '#202223',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "fontSize" INTEGER NOT NULL DEFAULT 14,
    "textAlign" TEXT NOT NULL DEFAULT 'center',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "dismissible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Announcement" ("bgColor", "createdAt", "dismissible", "fontSize", "id", "isActive", "link", "message", "shop", "textColor", "updatedAt") SELECT "bgColor", "createdAt", "dismissible", "fontSize", "id", "isActive", "link", "message", "shop", "textColor", "updatedAt" FROM "Announcement";
DROP TABLE "Announcement";
ALTER TABLE "new_Announcement" RENAME TO "Announcement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
