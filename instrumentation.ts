export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { seedDatabase } = await import("./lib/seed");
    await seedDatabase().catch((err) =>
      console.error("[seed] Failed to seed database:", err)
    );
  }
}
