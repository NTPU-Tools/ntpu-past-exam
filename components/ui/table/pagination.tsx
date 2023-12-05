import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { type Table } from "@tanstack/react-table";
import ReactPaginate from "react-paginate";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  total: number;
}

export function DataTablePagination<TData>({
  table,
  total,
}: DataTablePaginationProps<TData>) {
  const { pageSize, pageIndex } = table.getState().pagination;
  const lastPageIndex = Math.ceil(total / pageSize) - 1;

  const handlePageClick = ({
    selected: nextPageIndex,
  }: {
    selected: number;
  }) => {
    table.setPageIndex(nextPageIndex);
  };

  const fromRowCount =
    pageSize * pageIndex + (table.getRowModel().rows.length > 0 ? 1 : 0);
  const toRowCount = pageSize * pageIndex + table.getRowModel().rows.length;

  return (
    <div className="flex flex-col items-center justify-between gap-2 border-t bg-white p-4 text-sm sm:flex-row">
      <div className="text-muted-foreground flex-1">
        <span className="mr-2">{total}</span>
        筆資料中的第
        <span className="mx-2">
          {fromRowCount === toRowCount
            ? `${fromRowCount}`
            : `${fromRowCount} - ${toRowCount}`}
        </span>
        筆
      </div>
      <div className="flex flex-col items-center sm:flex-row sm:gap-2 sm:space-x-8">
        <div className="hidden items-center gap-2 sm:flex">
          <p className="text-muted-foreground whitespace-nowrap text-sm">
            行數 / 頁
          </p>
          <Select
            defaultValue="10"
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              table.resetPageIndex();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="選擇行數 / 頁" />
            </SelectTrigger>
            <SelectContent>
              {["10", "20", "50", "100"].map((item) => (
                <SelectItem value={item} key={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ReactPaginate
          key={`${pageSize}`}
          initialPage={lastPageIndex > 0 ? 0 : undefined}
          pageCount={lastPageIndex + 1}
          className="flex items-center space-x-2"
          pageRangeDisplayed={3}
          marginPagesDisplayed={1}
          pageLinkClassName="w-full h-full flex items-center justify-center outline-none focus-visible:ring-2 rounded-lg"
          pageClassName="cursor-pointer h-10 w-10 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          activeClassName="bg-primary text-primary-foreground hover:bg-primary/90 outline-none focus-visible:ring-2"
          onPageChange={handlePageClick}
          previousLinkClassName="outline-none"
          nextLinkClassName="outline-none"
          previousClassName="outline-none focus-visible:ring-2"
          nextClassName="outline-none focus-visible:ring-2"
          disabledLinkClassName="cursor-not-allowed"
          previousLabel={
            <Button variant="outline" size="icon" disabled={pageIndex === 0}>
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
          }
          nextLabel={
            <Button
              variant="outline"
              size="icon"
              disabled={pageIndex >= lastPageIndex}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
