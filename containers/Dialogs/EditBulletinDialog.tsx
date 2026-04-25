import instance from "@/api-client/instance";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { addBulletinSchema } from "@/schemas/bulletin";
import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import { useQueryState } from "@/hooks/useQueryState";
import { swrKeys } from "@/lib/swr-keys";
import { Loader2 } from "lucide-react";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import * as z from "zod";

interface pageProps {}

const EditBulletinDialog: FC<pageProps> = () => {
  const [addBulletinLoading, setAddBulletinLoading] = useState(false);
  const [addBulletinOpen, setAddBulletinOpen] = useState(false);
  const params = useParams();
  const { get, removeParams } = useQueryState();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof addBulletinSchema>>({
    resolver: zodResolver(addBulletinSchema as any),
  });

  const dialogOpen = get("open_edit_bulletin_dialog") === "true";

  const { data, isLoading, mutate: mutateBulletins } = useSWR(
    dialogOpen && params.admin_department_id
      ? swrKeys.departmentBulletins(params.admin_department_id as string)
      : null,
    () =>
      instance.get(
        `/departments/${params.admin_department_id}/bulletins`,
      ),
  );

  function closeEditBulletinDialog() {
    form.reset();
    removeParams("open_edit_bulletin_dialog");
  }

  const addBulletin = async (values: z.infer<typeof addBulletinSchema>) => {
    try {
      setAddBulletinLoading(true);
      await instance.postForm(
        `/bulletins/${params.admin_department_id}`,
        values,
      );
      toast({
        title: "操作成功",
      });
      mutateBulletins();
      setAddBulletinOpen(false);
    } catch (e) {
      toast({
        title: "操作失敗",
        variant: "error",
      });
    } finally {
      setAddBulletinLoading(false);
    }
  };

  const usersCol = createColumnHelper<any>();

  const columns: any[] = [
    usersCol.accessor("title", {
      header: "標題",
      size: 120,
      cell: (props) => <span>{props.getValue()}</span>,
    }),
    usersCol.accessor("content", {
      header: "內容",
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
            if (isLoading && !data) return;
            closeEditBulletinDialog();
          }
        }}
      >
        <DialogContent className="max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>編輯公告</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1">
            <DataTable columns={columns} data={data} />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setAddBulletinOpen(true);
              }}
            >
              新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={addBulletinOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddBulletinOpen(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增公告</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>公告標題</FormLabel>
                        <FormControl>
                          <Input placeholder="請輸入公告標題" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>公告內容</FormLabel>
                        <FormControl>
                          <Textarea placeholder="請輸入公告內容" {...field} />
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
              <Button
                variant="outline"
                className="w-full"
                disabled={addBulletinLoading}
              >
                {addBulletinLoading ? <Loader2 className="animate-spin" /> : null}
                取消
              </Button>
            </DialogClose>
            <Button
              disabled={addBulletinLoading}
              onClick={form.handleSubmit(addBulletin)}
            >
              {addBulletinLoading ? <Loader2 className="animate-spin" /> : null}
              送出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditBulletinDialog;
