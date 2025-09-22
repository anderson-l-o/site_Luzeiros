import run from "./seed-admin-and-types.js";
run().catch((e) => {
  console.error("Seeder failed", e);
  process.exit(1);
});
