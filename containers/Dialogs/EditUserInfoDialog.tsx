import instance from "@/api-client/instance";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { editUserInfoSchema } from "@/schemas/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { filter, forEach, get, map, set } from "lodash-es";
import { useQueryState } from "@/hooks/useQueryState";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import * as z from "zod";

const EditUserInfoDialog = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { get: getParam, removeParams } = useQueryState();

  const dialogOpen = getParam("open_edit_user_info_dialog") === "true";

  const { data, mutate } = useSWR(dialogOpen ? `me` : null, () =>
    instance.get("/users/me"),
  );

  const { data: departmentsData } = useSWR(
    dialogOpen ? "all-departments" : null,
    () => instance.get("/departments"),
  );

  const form = useForm<z.infer<typeof editUserInfoSchema>>({
    resolver: zodResolver(editUserInfoSchema as any),
    defaultValues: {
      note: "",
    },
  });

  function closeEditUserInfoDialog() {
    form.reset();

    removeParams("open_edit_user_info_dialog");
  }

  const onSubmit = async (values: z.infer<typeof editUserInfoSchema>) => {
    try {
      set(values, "school_id", data.username);
      set(
        values,
        "major",
        get(
          filter(departmentsData, (d) => d.id === values.major),
          "[0].name",
        ) ?? " ",
      );
      await instance.putForm("/users/update/me", values);
      toast({
        title: "修改成功",
      });
      mutate();
      closeEditUserInfoDialog();
    } catch (e) {
      toast({
        title: "修改失敗",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (data && departmentsData) {
      forEach(data, (value, key) => {
        if (key === "school_department") {
          form.setValue(
            "major",
            get(
              filter(departmentsData, (d) => d.name === value),
              "[0].id",
            ) ?? " ",
          );
        }
        if (key === "readable_name") {
          form.setValue("name", value);
        }
        if (key === "note") {
          form.setValue("note", value ?? "");
        }
      });
    }
  }, [data, departmentsData, form]);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeEditUserInfoDialog();
        }
      }}
    >
      <DialogContent className="max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>修改個人檔案</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
        <Form {...form}>
          <form>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名</FormLabel>
                    <FormControl>
                      <Input placeholder="請輸入姓名" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="major"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>主修</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="請選擇主修" />
                        </SelectTrigger>
                        <SelectContent>
                          {map(departmentsData, (department) => (
                            <SelectItem
                              value={department.id}
                              key={department.id}
                            >
                              {department.name}
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
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>備註</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="請輸入備註，如雙主修、輔系等相關資訊"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : null}
              取消
            </Button>
          </DialogClose>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : null}
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserInfoDialog;
