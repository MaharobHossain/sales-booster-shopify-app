-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "heading" TEXT NOT NULL DEFAULT 'You might also like',
    "headingColor" TEXT NOT NULL DEFAULT '#202223',
    "headingFontSizeDesktop" INTEGER NOT NULL DEFAULT 24,
    "headingFontSizeMobile" INTEGER NOT NULL DEFAULT 18,
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "productLimit" INTEGER NOT NULL DEFAULT 4,
    "columnsDesktop" INTEGER NOT NULL DEFAULT 4,
    "columnsMobile" INTEGER NOT NULL DEFAULT 2,
    "cardStyle" TEXT NOT NULL DEFAULT 'style1',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
