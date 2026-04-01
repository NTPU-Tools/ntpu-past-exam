import instance from "@/api-client/instance";
import { groupBy, sortBy } from "lodash-es";
import useSWR, { SWRResponse } from "swr";

const useDepartmentCourse = (
  departmentId: string | string[] | undefined,
  shouldFetch: Partial<boolean> = true,
): SWRResponse<
  {
    category: string;

    id: string;
    name: string;
  }[][]
> & {
  allCourses: {
    category: string;
    id: string;
    name: string;
  }[];
} => {
  const swrState = useSWR(
    departmentId && shouldFetch ? `${departmentId}-courses` : null,
    () => instance.get(`/departments/${departmentId}/courses`),
  );

  const { data } = swrState;

  if (!data) {
    return {
      ...swrState,
      allCourses: [],
    };
  }

  const items = sortBy(groupBy(data, "category")).sort((a, b) =>
    a[0].category.localeCompare(b[0].category, "zh-Hant"),
  );

  return {
    ...swrState,
    data: items,
    allCourses: data,
  };
};

export default useDepartmentCourse;
