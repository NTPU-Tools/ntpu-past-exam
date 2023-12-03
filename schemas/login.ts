import * as z from "zod";

export const loginSchema = z.object({
  username: z.string({ required_error: "請輸入學號" }).min(1, "請輸入學號"),
  password: z.string({ required_error: "請輸入密碼" }).min(1, "請輸入密碼"),
});
