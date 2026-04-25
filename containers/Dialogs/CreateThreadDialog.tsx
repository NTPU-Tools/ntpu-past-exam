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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createThreadSchema } from "@/schemas/thread";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryState } from "@/hooks/useQueryState";
import { swrKeys } from "@/lib/swr-keys";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { mutate } from "swr";
import * as z from "zod";

const GUIDELINES = [
  {
    title: "禁止人身攻擊",
    desc: "不得對他人進行辱罵、嘲諷、人身攻擊或仇恨言論，請保持理性、友善的討論氛圍。",
  },
  {
    title: "禁止不當圖片",
    desc: "不得上傳色情、暴力、血腥或其他違反善良風俗之圖片或內容。",
  },
  {
    title: "禁止廣告與垃圾訊息",
    desc: "不得張貼商業廣告、詐騙連結或重複無意義的內容。",
  },
  {
    title: "禁止侵犯隱私",
    desc: "不得未經同意公開他人個人資訊，例如學號、姓名、聯絡方式等。",
  },
  {
    title: "禁止著作權侵犯",
    desc: "禁止上傳原文書、商業出版教材或任何標有版權聲明的掃描檔。",
  },
];

function GuidelinesSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="text-primary underline underline-offset-2 hover:opacity-80"
        >
          社群規範
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-0 overflow-y-auto p-0">
        <SheetHeader className="px-6 py-5">
          <SheetTitle className="text-lg">討論區社群規範</SheetTitle>
          <p className="text-sm text-muted-foreground">
            為維護良好的討論環境，請所有使用者遵守以下規範。
            <br />
            違規內容將被移除，情節嚴重者將停止使用資格。
          </p>
        </SheetHeader>
        <Separator />
        <ul className="flex flex-col divide-y px-6">
          {GUIDELINES.map((g, i) => (
            <li key={g.title} className="py-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold text-destructive">
                  {i + 1}
                </span>
                <span className="font-medium">{g.title}</span>
              </div>
              <p className="pl-7 text-sm leading-relaxed text-muted-foreground">
                {g.desc}
              </p>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}

const CreateThreadDialog = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
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
    setAgreed(false);
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
      mutate(swrKeys.threads(courseId));
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
        <div className="flex flex-row items-start space-x-3 space-y-0 py-2">
          <Checkbox
            id="agree-guidelines"
            checked={agreed}
            onCheckedChange={(v) => setAgreed(Boolean(v))}
          />
          <label
            htmlFor="agree-guidelines"
            className="text-sm leading-snug text-muted-foreground"
          >
            我已閱讀並同意遵守{" "}
            <GuidelinesSheet />
          </label>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              取消
            </Button>
          </DialogClose>
          <Button
            disabled={!agreed}
            onClick={form.handleSubmit(onSubmit, (e) => {
              const firstError = Object.values(e ?? {})[0];
              toast({
                title:
                  (firstError && "message" in firstError
                    ? String(firstError.message)
                    : null) ?? "表單發生錯誤",
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
