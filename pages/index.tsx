import instance from "@/api/instance";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyBlockquote, TypographyH1 } from "@/components/ui/typography";
import userStore from "@/store/userStore";
import useSWR from "swr";

function Page() {
  const isActive = userStore().userData?.is_active;
  const { data } = useSWR(isActive ? "all-bulletins" : null, () =>
    instance.get("/bulletins"),
  );
  return (
    <div>
      <PageHeader>
        <TypographyH1>公告</TypographyH1>
      </PageHeader>
      <div>
        {data?.length ? (
          data.map((bulletin) => (
            <div className="my-4">
              <Card className="hover:bg-muted">
                <CardHeader className="flex flex-row">
                  <CardTitle className="truncate">{bulletin.title}</CardTitle>
                </CardHeader>
                <CardContent className="truncate">
                  {bulletin.content}
                </CardContent>
              </Card>
            </div>
          ))
        ) : (
          <TypographyBlockquote>
            暫無公告，感謝大家的測試～！
          </TypographyBlockquote>
        )}
      </div>
    </div>
  );
}

export default Page;
Page.title = "公告";
