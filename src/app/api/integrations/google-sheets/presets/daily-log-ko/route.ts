import { dailyLogKoPresetForApi } from "@/lib/integrations/google-sheets/presets/daily-log-ko";
import { jsonResponse } from "@/lib/utils";

export async function GET() {
  return jsonResponse(dailyLogKoPresetForApi());
}
