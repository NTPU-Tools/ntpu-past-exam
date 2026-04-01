import * as z from "zod";

export const addCourseSchema = z.object({
  name: z.string().min(1, "請輸入課程名稱"),
  category: z
    .string()
    .min(1, "請輸入課程類別"),
});
