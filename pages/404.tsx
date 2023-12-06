import { PageHeader } from "@/components/PageHeader";
import { TypographyH1 } from "@/components/ui/typography";

const NotFoundPage = () => (
  <div className="min-h-[inherit] flex flex-col relative top-0 ">
    <PageHeader>
      <TypographyH1>找不到頁面</TypographyH1>
    </PageHeader>
  </div>
);

export default NotFoundPage;
