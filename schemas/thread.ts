import * as z from "zod";

export const createThreadSchema = z.object({
  title: z.string().min(1, "請輸入標題").max(200, "標題不可超過 200 字"),
  content: z.string().min(1, "請輸入內容").max(2000, "內容不可超過 2000 字"),
  is_anonymous: z.boolean().optional(),
  image: z
    .custom<File>((val) => val instanceof File, "請選擇圖片")
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          file.type,
        ),
      "圖片格式限制 jpg、png、gif、webp",
    )
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "圖片不可超過 5MB",
    )
    .optional()
    .nullable(),
});

export const editThreadSchema = z.object({
  title: z.string().min(1, "請輸入標題").max(200, "標題不可超過 200 字").optional(),
  content: z.string().min(1, "請輸入內容").max(2000, "內容不可超過 2000 字").optional(),
  is_anonymous: z.boolean().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "請輸入留言內容").max(2000, "留言不可超過 2000 字"),
  is_anonymous: z.boolean().optional(),
});
