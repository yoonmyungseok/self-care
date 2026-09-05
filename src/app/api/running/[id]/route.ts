import { prisma } from "@/lib/db";
import { errorResponse, jsonResponse } from "@/lib/utils";
import { runningRecordSchema } from "@/lib/validations/schemas";
import { calculatePaceSeconds } from "@/lib/calculations/running";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const record = await prisma.runningRecord.findUnique({
      where: { id: parseInt(id, 10) },
      include: { splits: { orderBy: { splitNumber: "asc" } } },
    });
    if (!record) return errorResponse("기록을 찾을 수 없습니다", 404);
    return jsonResponse(record);
  } catch (error) {
    console.error("GET /api/running/[id]:", error);
    return errorResponse("러닝 기록을 불러오지 못했습니다", 500);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const recordId = parseInt(id, 10);
    const body = await request.json();
    const { splits, ...rest } = body;
    const parsed = runningRecordSchema.safeParse(rest);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "유효하지 않은 입력입니다");
    }

    const avgPaceSeconds = calculatePaceSeconds(
      parsed.data.distance,
      parsed.data.durationSeconds,
    );

    await prisma.$transaction(async (tx) => {
      if (splits !== undefined) {
        await tx.runningSplit.deleteMany({ where: { runningRecordId: recordId } });
        if (splits.length > 0) {
          await tx.runningSplit.createMany({
            data: splits.map(
              (s: { splitNumber: number; distance: number; durationSeconds: number }) => ({
                runningRecordId: recordId,
                ...s,
                paceSeconds: calculatePaceSeconds(s.distance, s.durationSeconds),
              }),
            ),
          });
        }
      }

      await tx.runningRecord.update({
        where: { id: recordId },
        data: { ...parsed.data, avgPaceSeconds },
      });
    });

    const record = await prisma.runningRecord.findUnique({
      where: { id: recordId },
      include: { splits: { orderBy: { splitNumber: "asc" } } },
    });

    return jsonResponse(record);
  } catch (error) {
    console.error("PUT /api/running/[id]:", error);
    return errorResponse("러닝 기록을 수정하지 못했습니다", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.runningRecord.delete({ where: { id: parseInt(id, 10) } });
    return jsonResponse({ success: true });
  } catch (error) {
    console.error("DELETE /api/running/[id]:", error);
    return errorResponse("러닝 기록을 삭제하지 못했습니다", 500);
  }
}
