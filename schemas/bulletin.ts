import * as z from "zod";

export const addBulletinSchema = z.object({
  title: z
    .string({ required_error: "請輸入公告標題" })
    .min(1, "請輸入公告標題"),
  content: z
    .string({ required_error: "請輸入公告內容" })
    .min(1, "請輸入公告內容"),
});
