import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TypographyH2, TypographyP } from "@/components/ui/typography";

interface Props {
  open: boolean;
  close: () => void;
}

const ServiceTermDialog = ({ open, close }: Props) => (
  <Dialog
    open={open}
    onOpenChange={(dialogOpen) => {
      if (!dialogOpen) {
        close();
      }
    }}
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>服務條款</DialogTitle>
      </DialogHeader>

      <TypographyH2>服務供應者</TypographyH2>
      <TypographyP>NTPU Tools 團隊</TypographyP>

      <TypographyH2>服務內容</TypographyH2>
      <TypographyP>
        此服務提供台北大學學生查詢考古題的平台，您可以在此瀏覽、搜尋、上傳、分享考古題。
      </TypographyP>

      <TypographyH2>個資蒐集</TypographyH2>
      <TypographyP>
        此服務在登入時利用 Google Login
        驗證身份並蒐集您的學號、姓名以及信箱（僅限於此三項資訊），且不會對您的密碼做任何之保留行為。
      </TypographyP>

      <TypographyH2>您的行為準則</TypographyH2>
      <TypographyP>
        切勿濫用、破壞、干擾服務，或是導致服務中斷，例如以詐欺或詐騙手法存取或使用服務、導入惡意軟體、濫發垃圾內容、入侵或規避我們的系統或保護措施。
      </TypographyP>
      <TypographyP>切勿嘗試上傳不實或誤導他人的考古題資訊。</TypographyP>
      <TypographyP>切勿嘗試上傳任何侵犯他人智慧財產權的資訊。</TypographyP>

      <TypographyH2>您的內容的使用權限</TypographyH2>
      <TypographyP>
        我們的服務可讓您上傳、提交、儲存、傳送、接收或分享您的內容。您並無義務向我們提供任何內容，且可以自由選擇要提供的內容。如果您選擇上傳或分享內容，請確認您擁有相關必要權利，且該內容無違法之虞。
      </TypographyP>
      <TypographyP>
        您的內容仍屬於您所有。換句話說，您仍保有自己內容的所有智慧財產權。
        舉例來說，您擁有您原創內容 (例如您撰寫的評論)
        的智慧財產權。您也可能有權分享其他人的原創內容，前提是您已取得對方許可。
      </TypographyP>
      <DialogFooter>
        <DialogClose asChild>
          <Button>關閉</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ServiceTermDialog;
