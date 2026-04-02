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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createThreadSchema } from "@/schemas/thread";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryState } from "@/hooks/useQueryState";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { mutate } from "swr";
import * as z from "zod";

const CreateThreadDialog = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const { get, removeParams } = useQueryState();
  const courseId = params.course_id as string | undefined;

  const form = useForm<z.infer<typeof createThreadSchema>>({
    resolver: zodResolver(createThreadSchema),
    defaultValues: {
      title: "",
      content: "",
      is_anonymous: false,
      image: null,
    },
  });

  function closeDialog() {
    form.reset();
    removeParams("open_create_thread_dialog");
  }

  const onSubmit = async (values: z.infer<typeof createThreadSchema>) => {
    if (!courseId) return;
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.set("title", values.title);
      formData.set("content", values.content);
      formData.set("is_anonymous", String(values.is_anonymous ?? false));
      if (values.image) formData.set("image", values.image);

      await instance.postForm(`/threads/${courseId}`, formData);
      toast({ title: "發文成功" });
      mutate(`threads-${courseId}`);
      closeDialog();
    } catch {
      toast({ title: "發文失敗", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={get("open_create_thread_dialog") === "true"}
      onOpenChange={(open) => {
        if (!open) closeDialog();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新增討論</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="grid gap-3">
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
                  <FormLabel className="leading-none">匿名發文</FormLabel>
                </FormItem>
              )}
            />
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>內容</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="請輸入內容"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>圖片（選填）</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        field.onChange(e.target.files?.[0] ?? null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
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
            發文
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateThreadDialog;
