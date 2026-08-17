-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SocialProof" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'simple',
    "mode" TEXT NOT NULL DEFAULT 'demo',
    "position" TEXT NOT NULL DEFAULT 'bottom-left',
    "pageTargeting" TEXT NOT NULL DEFAULT 'all',
    "displayDuration" INTEGER NOT NULL DEFAULT 5000,
    "intervalBetween" INTEGER NOT NULL DEFAULT 8000,
    "firstDelayMs" INTEGER NOT NULL DEFAULT 3000,
    "randomizeOrder" BOOLEAN NOT NULL DEFAULT true,
    "showTimeAgo" BOOLEAN NOT NULL DEFAULT true,
    "demoItems" TEXT NOT NULL DEFAULT '[]',
    "bgColor" TEXT NOT NULL DEFAULT '#ffffff',
    "gradientStart" TEXT NOT NULL DEFAULT '#fff9db',
    "gradientEnd" TEXT NOT NULL DEFAULT '#ffe3ec',
    "textColor" TEXT NOT NULL DEFAULT '#202223',
    "accentColor" TEXT NOT NULL DEFAULT '#008060',
    "brandLine" TEXT NOT NULL DEFAULT '',
    "fontSizeDesktop" INTEGER NOT NULL DEFAULT 14,
    "fontSizeMobile" INTEGER NOT NULL DEFAULT 12,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SocialProof" ("accentColor", "bgColor", "createdAt", "demoItems", "displayDuration", "firstDelayMs", "fontSizeDesktop", "fontSizeMobile", "id", "intervalBetween", "isActive", "mode", "pageTargeting", "position", "randomizeOrder", "shop", "showTimeAgo", "textColor", "updatedAt") SELECT "accentColor", "bgColor", "createdAt", "demoItems", "displayDuration", "firstDelayMs", "fontSizeDesktop", "fontSizeMobile", "id", "intervalBetween", "isActive", "mode", "pageTargeting", "position", "randomizeOrder", "shop", "showTimeAgo", "textColor", "updatedAt" FROM "SocialProof";
DROP TABLE "SocialProof";
ALTER TABLE "new_SocialProof" RENAME TO "SocialProof";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
