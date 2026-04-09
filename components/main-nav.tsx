import instance from "@/api-client/instance";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getCookie } from "@/utils/cookie";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";

export function MainNav() {
  const accessToken = getCookie("ntpu-past-exam-access-token");
  const router = useRouter();
  const params = useParams();
  const { data } = useSWR(accessToken ? "visible-departments" : null, () =>
    instance.get("/departments/visible"),
  );

  return (
    <div className="hidden md:flex items-center gap-4">
      <Link href="/?mode=select" className="shrink-0">
        <span className="font-heading font-black text-[15px] tracking-tight">NTPU 考古題</span>
        {process.env.NEXT_PUBLIC_GIT_BRANCH !== "main" && (
          <span className="text-[9px] text-destructive font-bold ml-1 uppercase tracking-wider">dev</span>
        )}
      </Link>
      {params?.department_id && (
        <>
          <span className="text-border">/</span>
          <Select
            value={(params?.department_id as string | undefined) ?? undefined}
            onValueChange={(value) => router.push(`/${value}`)}
          >
            <SelectTrigger className="min-w-[160px] border-0 shadow-none bg-transparent pl-0 font-medium">
              <SelectValue placeholder="選擇社群" />
            </SelectTrigger>
            <SelectContent>
              {data?.length &&
                data.map((department: any) => (
                  <SelectItem value={department.id} key={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
}
