-- CreateTable
CREATE TABLE "CountdownTimer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'minimal',
    "mode" TEXT NOT NULL DEFAULT 'fixed',
    "endDateTime" DATETIME,
    "dailyEndTime" TEXT NOT NULL DEFAULT '23:59',
    "title" TEXT NOT NULL DEFAULT 'Limited Time Offer',
    "caption" TEXT NOT NULL DEFAULT '',
    "buttonText" TEXT NOT NULL DEFAULT '',
    "buttonLink" TEXT NOT NULL DEFAULT '',
    "bgColor" TEXT NOT NULL DEFAULT '#202223',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "accentColor" TEXT NOT NULL DEFAULT '#008060',
    "titleFontSizeDesktop" INTEGER NOT NULL DEFAULT 22,
    "titleFontSizeMobile" INTEGER NOT NULL DEFAULT 16,
    "numberFontSizeDesktop" INTEGER NOT NULL DEFAULT 36,
    "numberFontSizeMobile" INTEGER NOT NULL DEFAULT 24,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
