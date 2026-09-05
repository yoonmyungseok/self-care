import { prisma } from "@/lib/db";
import type { UserSettings } from "@prisma/client";

const DEFAULT_SETTINGS = {
  targetWeight: 70.0,
  targetCalories: 2000.0,
  targetCarbs: 250.0,
  targetProtein: 120.0,
  targetFat: 65.0,
};

export async function getSettings(): Promise<UserSettings> {
  let settings = await prisma.userSettings.findFirst();
  if (!settings) {
    settings = await prisma.userSettings.create({ data: DEFAULT_SETTINGS });
  }
  return settings;
}
