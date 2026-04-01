import * as z from "zod";

export const editUserInfoSchema = z.object({
  name: z.string().min(1, "請輸入姓名"),
  major: z.string().min(1, "請選擇主修"),
  note: z.string().optional(),
});
