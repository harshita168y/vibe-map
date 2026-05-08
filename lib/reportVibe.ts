// import { supabase } from "@/lib/supabase";

// export async function reportVibe(vibeId: string, reason = "Reported by user") {
//   const { error } = await supabase.from("vibe_reports").insert({
//     vibe_id: vibeId,
//     reason,
//   });

//   if (error) {
//     throw new Error(error.message);
//   }
// }

import { supabase } from "@/lib/supabase";

type ReportVibeResult = {
  ok: boolean;
  alreadyReported?: boolean;
  message?: string;
};

export async function reportVibe(
  vibeId: string,
  reason: string,
  deviceId: string
): Promise<ReportVibeResult> {
  const { error } = await supabase.from("vibe_reports").insert({
    vibe_id: vibeId,
    reason,
    device_id: deviceId,
  });
    if (error) {
          if (error.message.includes("unique_vibe_report_per_device")) {
            return {
              ok: false,
              alreadyReported: true,
              message: "You already reported this vibe.",
            };
          }

          if (error.message.includes("vibe_reports_vibe_id_fkey")) {
            return {
              ok: false,
              message: "This vibe is no longer available.",
               }     };
          }

  return {
    ok: true,
  };
}