-- CreateTable
CREATE TABLE "SocialProof" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'demo',
    "position" TEXT NOT NULL DEFAULT 'bottom-left',
    "displayDuration" INTEGER NOT NULL DEFAULT 5000,
    "intervalBetween" INTEGER NOT NULL DEFAULT 8000,
    "demoItems" TEXT NOT NULL DEFAULT '[]',
    "bgColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#202223',
    "accentColor" TEXT NOT NULL DEFAULT '#008060',
    "fontSizeDesktop" INTEGER NOT NULL DEFAULT 14,
    "fontSizeMobile" INTEGER NOT NULL DEFAULT 12,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
