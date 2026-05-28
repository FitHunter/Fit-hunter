// Prisma 7 deletes unrecognized files in its output directory on generate.
// This script restores the re-export index that the rest of the app imports.
import { writeFileSync } from "fs";
writeFileSync(
  "src/generated/prisma/index.ts",
  "export * from './client'\nexport * from './enums'\nexport * from './models'\n"
);
