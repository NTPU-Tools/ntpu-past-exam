import instance from "@/api/instance";
import { groupBy, sortBy } from "lodash-es";
import useSWR, { SWRResponse } from "swr";

const useDepartmentCourse = (
  departmentId: string | string[] | undefined,
  shouldFetch: Partial<boolean> = true,
): SWRResponse<any[][]> => {
  const swrState = useSWR(
    departmentId && shouldFetch ? `${departmentId}-courses` : null,
    () => instance.get(`/departments/${departmentId}/courses`),
  );

  const { data } = swrState;

  if (!data) {
    return swrState;
  }

  const items = sortBy(groupBy(data, "category")).sort((a, b) =>
    a[0].category.localeCompare(b[0].category, "zh-Hant"),
  );

  return {
    ...swrState,
    data: items,
  };
};

export default useDepartmentCourse;
