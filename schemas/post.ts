import * as z from "zod";

export const createPostSchema = z.object({
  title: z.string({ required_error: "請輸入標題" }).min(1, "請輸入標題"),
  content: z.string().optional(),
  course_id: z.string({ required_error: "請選擇課程" }).min(1, "請選擇課程"),
  file: z
    .custom<File>((val) => val instanceof File, "請選擇考古題檔案")
    .refine(
      (file) => ["application/pdf"].includes(file.type),
      "檔案格式限制上傳 pdf",
    ),
});
