import instance from "@/api/instance";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TypographySmall } from "@/components/ui/typography";
import userStore from "@/store/userStore";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";

export function MainNav() {
  const router = useRouter();
  const isAdmin = router.pathname.includes("admin");
  const { userData } = userStore();
  const { data } = useSWR(
    userData?.is_active ? "visible-departments" : null,
    () => instance.get("/departments/visible"),
  );

  return (
    <div className="hidden md:flex gap-6 md:gap-10">
      <Link
        href="/"
        className="flex items-center space-x-2 basis-full whitespace-nowrap"
      >
        <span className="font-bold">
          NTPU 考古題 <TypographySmall>Beta</TypographySmall>{" "}
        </span>
      </Link>
      {router.query?.department_id && (
        <Select
          defaultValue={
            (router.query?.department_id as string | undefined) ?? undefined
          }
          onValueChange={(value) => {
            router.push(`/${value}`);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="請選擇社群" />
          </SelectTrigger>
          <SelectContent>
            {data?.length &&
              data.map((department) => (
                <SelectItem value={department.id} key={department.id}>
                  {department.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
