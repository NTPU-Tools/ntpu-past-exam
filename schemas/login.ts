import * as z from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "請輸入學號"),
  password: z.string().min(1, "請輸入密碼"),
});
