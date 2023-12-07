import { PageHeader } from "@/components/PageHeader";
import { TypographyBlockquote, TypographyH1 } from "@/components/ui/typography";

function Page() {
  return (
    <div>
      <PageHeader>
        <TypographyH1>公告</TypographyH1>
      </PageHeader>
      <div>
        <TypographyBlockquote>
          暫無公告，感謝大家的測試～！
        </TypographyBlockquote>
      </div>
    </div>
  );
}

export default Page;
Page.title = "公告";
