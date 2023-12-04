import instance from "@/api/instance";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { useToast } from "@/components/ui/use-toast";
import { createPostSchema } from "@/schemas/post";
import { zodResolver } from "@hookform/resolvers/zod";
import { groupBy, map, omit } from "lodash-es";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useSWR, { mutate } from "swr";
import * as z from "zod";

const CreatePostDialog = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const query = router.query;
  const { data } = useSWR("courseData", () => instance.get("/courses"));

  const items = groupBy(data, "category");

  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
  });

  function closeCreatePostDialog() {
    form.reset();
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
      await instance.postForm("/posts", values);
      toast({
        title: "新增成功",
      });
      mutate(`course-${values.course_id}`);
      closeCreatePostDialog();
    } catch (e) {
      toast({
        title: "新增失敗",
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
        <DialogTitle>上傳考古題</DialogTitle>
        <Form {...form}>
          <form>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>標題</FormLabel>
                    <FormControl>
                      <Input placeholder="請輸入標題" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>考古題檔案</FormLabel>
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
                          {map(items, (value, key) => (
                            <SelectGroup key={key}>
                              <SelectLabel>{key}</SelectLabel>
                              {map(value, (course) => (
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
            </div>
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" isLoading={isLoading}>
              取消
            </Button>
          </DialogClose>
          <Button onClick={form.handleSubmit(onSubmit)} isLoading={isLoading}>
            上傳
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
