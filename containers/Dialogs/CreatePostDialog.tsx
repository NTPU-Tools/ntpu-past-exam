import instance from "@/api-client/instance";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TypographyBlockquote } from "@/components/ui/typography";
import { useToast } from "@/components/ui/use-toast";
import useDepartmentCourse from "@/hooks/useDepartmentCourse";
import { createPostSchema } from "@/schemas/post";
import { zodResolver } from "@hookform/resolvers/zod";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { forEach, head, map, omit } from "lodash-es";
import { useRouter } from "next/router";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import useSWR, { mutate } from "swr";
import * as z from "zod";

const CreatePostDialog = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const query = router.query;

  const isAdminPage = router.pathname.includes("admin");

  const { data: courseData, allCourses } = useDepartmentCourse(
    router.query.department_id,
    !isAdminPage,
  );

  const { data: departmentData } = useSWR(
    router.query.department_id
      ? `department-${router.query.department_id}`
      : null,
    () => instance.get(`/departments/${router.query.department_id}`),
  );

  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      files: null,
    },
  });

  const {
    fields: fileFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    // @ts-ignore
    name: "files",
  });

  function closeCreatePostDialog() {
    form.reset();
    forEach(fileFields, (_, index) => {
      remove(index);
    });
    router.replace(
      { query: omit(query, "open_create_post_dialog") },
      undefined,
      {
        shallow: true,
      },
    );
  }

  const onSubmit = async (values: z.infer<typeof createPostSchema>) => {
    try {
      setIsLoading(true);

      const course = allCourses.find((c) => c.id === values.course_id);
      const formData = new FormData();
      formData.set(
        "title",
        `${course?.name ?? ""}-${values.year}-${values.semester}-${
          values.teacher
        }-${values.term}`,
      );
      formData.set("department_id", query.department_id as string);
      // @ts-ignore
      formData.set("is_anonymous", values.is_anonymous ?? false);
      if (values.content) formData.set("content", values.content);
      formData.set("course_id", values.course_id);
      if (values.files?.length) {
        forEach(values.files, (file) => {
          formData.append("files", file);
        });
      }
      await instance.postForm("/posts", formData);
      toast({
        title: "新增成功",
      });
      mutate(`course-${values.course_id}`);
      closeCreatePostDialog();
    } catch (e) {
      toast({
        title: "新增失敗",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={query?.open_create_post_dialog === "true"}
      onOpenChange={(open) => {
        if (!open) {
          closeCreatePostDialog();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>上傳考古題</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="is_anonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="leading-none">
                      <FormLabel>匿名上傳</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>課程</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="請選擇課程" />
                        </SelectTrigger>
                        <SelectContent>
                          {map(courseData, (courses, key) => (
                            <SelectGroup key={key}>
                              <SelectLabel>
                                {head(courses ?? [])?.category}
                              </SelectLabel>
                              {map(courses, (course) => (
                                <SelectItem value={course.id} key={course.id}>
                                  {course.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>學年</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="請選擇學年" />
                        </SelectTrigger>
                        <SelectContent>
                          {map(
                            Array.from(
                              { length: 5 },
                              (_, i) => i + new Date().getFullYear() - 1911 - 5,
                            ),
                            (y) => (
                              <SelectItem value={String(y)} key={String(y)}>
                                {y}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>學期</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="請選擇學期" />
                        </SelectTrigger>
                        <SelectContent>
                          {map(["上學期", "下學期"], (s) => (
                            <SelectItem value={s} key={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teacher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>老師名稱</FormLabel>
                    <FormControl>
                      <Input placeholder="請輸入老師名稱" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>考試分類</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="請選擇考試分類" />
                        </SelectTrigger>
                        <SelectContent>
                          {map(["期中考", "期末考"], (t) => (
                            <SelectItem value={t} key={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>內文</FormLabel>
                    <FormControl>
                      <Textarea placeholder="請輸入內文" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col my-2 space-y-2">
                <FormLabel className="">考古題檔案</FormLabel>
                {map(fileFields, (_, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="grow">
                      <FormField
                        control={form.control}
                        name={`files.${index}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              {/* @ts-ignore */}
                              <Input
                                placeholder="請選擇考古題檔案"
                                {...field}
                                type="file"
                                // @ts-ignore
                                value={field.value?.fileName}
                                onChange={(event) => {
                                  field.onChange(event.target.files?.[0]);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      className="flex-shrink-0"
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        remove(index);
                      }}
                    >
                      <CrossCircledIcon />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    append(new File([""], ""));
                  }}
                >
                  新增檔案
                </Button>
                <FormDescription>僅接受 pdf 格式之檔案</FormDescription>
              </div>
            </div>
          </form>
        </Form>
        {!departmentData?.is_public && (
          <TypographyBlockquote>
            待管理員審核通過後，才會顯示在課程頁面上。
          </TypographyBlockquote>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" isLoading={isLoading}>
              取消
            </Button>
          </DialogClose>
          <Button
            onClick={form.handleSubmit(onSubmit, (e) => {
              toast({
                title: e?.[Object.keys(e)?.[0]]?.message ?? "表單發生錯誤",
                variant: "error",
              });
            })}
            isLoading={isLoading}
          >
            上傳
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
