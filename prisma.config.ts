import "dotenv/config";
import { defineConfig } from "prisma/config";

function getDirectUrl(): string | undefined {
  const url = process.env["POSTGRES_URL"];
  const hostUnpooled = process.env["PGHOST_UNPOOLED"];
  if (!url || !hostUnpooled) return url;
  try {
    const parsed = new URL(url);
    parsed.hostname = hostUnpooled;
    return parsed.toString();
  } catch {
    return url;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["POSTGRES_URL"],
    directUrl: getDirectUrl(),
  },
});