import instance from "@/api/instance";
import { DataTable } from "@/components/ClientPaginationDataTable";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { addCourseSchema } from "@/schemas/course";
import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper } from "@tanstack/react-table";
import { map, omit } from "lodash-es";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR, { mutate } from "swr";
import * as z from "zod";

interface pageProps {}

const UpdateUserStatusDialog: FC<pageProps> = () => {
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const router = useRouter();
  const query = router.query;
  const { toast } = useToast();

  const form = useForm<z.infer<typeof addCourseSchema>>({
    resolver: zodResolver(addCourseSchema),
  });

  const dialogOpen = query?.open_edit_course_dialog === "true";

  const { data } = useSWR(dialogOpen ? "all-courses" : null, () =>
    instance.get("/courses"),
  );

  function closeEditUserDialog() {
    form.reset();
    router.replace(
      { query: omit(query, "open_edit_course_dialog") },
      undefined,
      {
        shallow: true,
      },
    );
  }

  const addCourse = async (values: z.infer<typeof addCourseSchema>) => {
    try {
      setAddCourseLoading(true);
      await instance.postForm(`/courses`, values);
      toast({
        title: "操作成功",
      });
      mutate("all-courses");
      setAddCourseOpen(false);
    } catch (e) {
      toast({
        title: "操作失敗",
        variant: "error",
      });
    } finally {
      setAddCourseLoading(false);
    }
  };

  const usersCol = createColumnHelper<any>();

  const columns: any[] = [
    usersCol.accessor("name", {
      header: "課程名稱",
      size: 120,
      cell: (props) => <span>{props.getValue()}</span>,
    }),
    usersCol.accessor("category", {
      header: "類別",
      size: 120,
      cell: (props) => <span>{props.getValue()}</span>,
    }),
  ];

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeEditUserDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯課程</DialogTitle>
          </DialogHeader>

          <DataTable columns={columns} data={data} />
          <DialogFooter>
            <Button
              onClick={() => {
                setAddCourseOpen(true);
              }}
            >
              新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={addCourseOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddCourseOpen(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增課程</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>課程名稱</FormLabel>
                        <FormControl>
                          <Input placeholder="請輸入課程名稱" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>課程類別</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="請選擇課程類別" />
                            </SelectTrigger>
                            <SelectContent>
                              {map(
                                [
                                  "大一課程考古題庫",
                                  "大二課程考古題庫",
                                  "大三課程考古題庫",
                                  "大四課程考古題庫",
                                  "其他",
                                ],
                                (value) => (
                                  <SelectItem value={value} key={value}>
                                    {value}
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
                </div>
                <FormMessage>{form.formState.errors.root?.message}</FormMessage>
              </div>
            </form>
          </Form>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline" isLoading={addCourseLoading}>
                取消
              </Button>
            </DialogClose>
            <Button
              isLoading={addCourseLoading}
              onClick={form.handleSubmit(addCourse)}
            >
              送出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateUserStatusDialog;
