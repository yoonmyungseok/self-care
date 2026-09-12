import { PrismaClient } from "@prisma/client";
import { subDays, format } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.foodEntry.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.runningSplit.deleteMany();
  await prisma.runningRecord.deleteMany();
  await prisma.runningType.deleteMany();
  await prisma.weightRecord.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.userSettings.deleteMany();

  await prisma.runningType.createMany({
    data: [
      { value: "easy", label: "이지런", excludeFromStats: false, sortOrder: 0 },
      { value: "recovery", label: "회복주", excludeFromStats: false, sortOrder: 1 },
      { value: "lsd", label: "LSD", excludeFromStats: false, sortOrder: 2 },
      { value: "rest", label: "휴식", excludeFromStats: true, sortOrder: 3 },
      { value: "tempo", label: "지속주", excludeFromStats: false, sortOrder: 4 },
    ],
  });
  console.log("✅ Running types created");

  const settings = await prisma.userSettings.create({
    data: {
      targetWeight: 68.0,
      targetCalories: 2000,
      targetCarbs: 250,
      targetProtein: 120,
      targetFat: 65,
    },
  });
  console.log("✅ Settings created:", settings);

  const today = new Date();
  const weightData = [];
  let baseWeight = 72.5;

  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(today, i), "yyyy-MM-dd");
    const fluctuation = (Math.random() - 0.5) * 0.4;
    baseWeight += fluctuation * 0.3;
    if (i % 7 === 0) baseWeight -= 0.1;

    weightData.push({
      date,
      weight: Math.round(baseWeight * 10) / 10,
      steps: Math.floor(6000 + Math.random() * 8000),
      water: Math.round((1.5 + Math.random() * 1.5) * 10) / 10,
      sleep: Math.round((6 + Math.random() * 2.5) * 10) / 10,
      condition: ["good", "normal", "great"][Math.floor(Math.random() * 3)],
      bowelMovement: "normal",
      memo: i === 0 ? "오늘 기록" : null,
    });
  }

  await prisma.weightRecord.createMany({ data: weightData });
  console.log(`✅ ${weightData.length} weight records created`);

  const runningRecords = [
    {
      date: format(subDays(today, 1), "yyyy-MM-dd"),
      type: "easy",
      distance: 8.0,
      durationSeconds: 48 * 60,
      avgHeartRate: 145,
      maxHeartRate: 162,
      cadence: 172,
      memo: "이지런 8km",
    },
    {
      date: format(subDays(today, 3), "yyyy-MM-dd"),
      type: "tempo",
      distance: 10.0,
      durationSeconds: 55 * 60,
      avgHeartRate: 158,
      maxHeartRate: 175,
      cadence: 178,
      memo: "지속주 10km",
    },
    {
      date: format(subDays(today, 5), "yyyy-MM-dd"),
      type: "recovery",
      distance: 5.0,
      durationSeconds: 35 * 60,
      avgHeartRate: 130,
      maxHeartRate: 148,
      cadence: 165,
    },
    {
      date: format(subDays(today, 7), "yyyy-MM-dd"),
      type: "lsd",
      distance: 15.0,
      durationSeconds: 90 * 60,
      avgHeartRate: 140,
      maxHeartRate: 155,
      cadence: 170,
      memo: "LSD 15km",
    },
    {
      date: format(subDays(today, 10), "yyyy-MM-dd"),
      type: "easy",
      distance: 6.0,
      durationSeconds: 36 * 60,
      avgHeartRate: 142,
      maxHeartRate: 158,
      cadence: 170,
    },
    {
      date: format(subDays(today, 14), "yyyy-MM-dd"),
      type: "tempo",
      distance: 8.0,
      durationSeconds: 44 * 60,
      avgHeartRate: 160,
      maxHeartRate: 178,
      cadence: 180,
    },
    {
      date: format(subDays(today, 18), "yyyy-MM-dd"),
      type: "easy",
      distance: 7.0,
      durationSeconds: 42 * 60,
      avgHeartRate: 143,
      maxHeartRate: 160,
      cadence: 168,
    },
  ];

  for (const record of runningRecords) {
    const paceSeconds = (record.durationSeconds / 60) / record.distance * 60;
    const created = await prisma.runningRecord.create({
      data: {
        ...record,
        avgPaceSeconds: paceSeconds,
        splits: {
          create: [
            {
              splitNumber: 1,
              distance: record.distance / 2,
              durationSeconds: Math.floor(record.durationSeconds / 2),
              paceSeconds: paceSeconds,
            },
            {
              splitNumber: 2,
              distance: record.distance / 2,
              durationSeconds: Math.ceil(record.durationSeconds / 2),
              paceSeconds: paceSeconds,
            },
          ],
        },
      },
    });
    console.log(`✅ Running record created: ${created.date} ${created.distance}km`);
  }

  const foodItems = [
    { name: "현미밥", standardAmount: "130g", calories: 210, carbs: 45, protein: 3, fat: 1.8, sodium: 15 },
    { name: "닭가슴살", standardAmount: "100g", calories: 165, carbs: 0, protein: 31, fat: 3.6, sodium: 74 },
    { name: "계란", standardAmount: "1개(50g)", calories: 78, carbs: 0.6, protein: 6.3, fat: 5.3, sodium: 62 },
    { name: "바나나", standardAmount: "1개(120g)", calories: 105, carbs: 27, protein: 1.3, fat: 0.4, sodium: 1 },
    { name: "그릭요거트", standardAmount: "150g", calories: 130, carbs: 8, protein: 15, fat: 5, sodium: 60 },
    { name: "아몬드", standardAmount: "30g", calories: 175, carbs: 6, protein: 6, fat: 15, sodium: 0 },
    { name: "샐러드", standardAmount: "200g", calories: 50, carbs: 8, protein: 3, fat: 1, sodium: 30 },
    { name: "연어", standardAmount: "100g", calories: 208, carbs: 0, protein: 20, fat: 13, sodium: 59 },
  ];

  await prisma.foodItem.createMany({ data: foodItems });
  console.log(`✅ ${foodItems.length} food items created`);

  const todayStr = format(today, "yyyy-MM-dd");

  const breakfast = await prisma.meal.create({
    data: { date: todayStr, mealType: "breakfast" },
  });
  await prisma.foodEntry.createMany({
    data: [
      { mealId: breakfast.id, foodName: "현미밥", amount: 1, unit: "130g", calories: 210, carbs: 45, protein: 3, fat: 1.8, sodium: 15 },
      { mealId: breakfast.id, foodName: "계란", amount: 2, unit: "1개(50g)", calories: 156, carbs: 1.2, protein: 12.6, fat: 10.6, sodium: 124 },
      { mealId: breakfast.id, foodName: "바나나", amount: 1, unit: "1개(120g)", calories: 105, carbs: 27, protein: 1.3, fat: 0.4, sodium: 1 },
    ],
  });

  const lunch = await prisma.meal.create({
    data: { date: todayStr, mealType: "lunch" },
  });
  await prisma.foodEntry.createMany({
    data: [
      { mealId: lunch.id, foodName: "닭가슴살", amount: 1.5, unit: "100g", calories: 248, carbs: 0, protein: 46.5, fat: 5.4, sodium: 111 },
      { mealId: lunch.id, foodName: "샐러드", amount: 1, unit: "200g", calories: 50, carbs: 8, protein: 3, fat: 1, sodium: 30 },
      { mealId: lunch.id, foodName: "현미밥", amount: 0.77, unit: "130g", calories: 162, carbs: 35, protein: 2.3, fat: 1.4, sodium: 12 },
    ],
  });

  const snack = await prisma.meal.create({
    data: { date: todayStr, mealType: "snack" },
  });
  await prisma.foodEntry.create({
    data: {
      mealId: snack.id,
      foodName: "그릭요거트",
      amount: 1,
      unit: "150g",
      calories: 130,
      carbs: 8,
      protein: 15,
      fat: 5,
      sodium: 60,
    },
  });

  console.log("✅ Today's diet created");
  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
