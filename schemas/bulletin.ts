import * as z from "zod";

export const addBulletinSchema = z.object({
  title: z
    .string()
    .min(1, "請輸入公告標題"),
  content: z
    .string()
    .min(1, "請輸入公告內容"),
});
