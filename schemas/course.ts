import * as z from "zod";

export const addCourseSchema = z.object({
  name: z.string({ required_error: "請輸入課程名稱" }).min(1, "請輸入課程名稱"),
  category: z
    .string({ required_error: "請輸入課程類別" })
    .min(1, "請輸入課程類別"),
});
