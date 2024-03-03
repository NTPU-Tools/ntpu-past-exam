import * as z from "zod";

export const createPostSchema = z.object({
  year: z.string({ required_error: "請選擇學年" }).min(1, "請選擇學年"),
  semester: z.string({ required_error: "請選擇學期" }).min(1, "請選擇學期"),
  teacher: z
    .string({ required_error: "請輸入老師名稱" })
    .min(1, "請輸入老師名稱"),
  term: z.string({ required_error: "請選擇考試分類" }).min(1, "請選擇考試分類"),
  content: z.string().optional(),
  course_id: z.string({ required_error: "請選擇課程" }).min(1, "請選擇課程"),
  files: z.array(
    z
      .custom<File>((val) => val instanceof File, "請選擇考古題檔案")
      .refine(
        (file) => ["application/pdf"].includes(file.type),
        "檔案格式限制上傳 pdf",
      ),
  ),
});
