import { Outlet, createBrowserRouter } from "react-router-dom"
import HomePage from "@/app/page"
import LoginPage from "@/app/login/page"
import NotFoundPage from "@/app/not-found"
import DepartmentPage from "@/app/[department_id]/page"
import CoursePage from "@/app/[department_id]/[course_id]/page"
import PostPage from "@/app/[department_id]/[course_id]/[post_id]/page"
import ThreadListPage from "@/app/[department_id]/[course_id]/thread/page"
import ThreadDetailPage from "@/app/[department_id]/[course_id]/thread/[thread_id]/page"
import AdminDashboard from "@/app/admin/[admin_department_id]/page"
import { Providers } from "@/app/providers"
import {
  AdminTitleLayout,
  AppGuard,
  CourseTitleLayout,
  DepartmentTitleLayout,
  PostTitleLayout,
  StaticTitle,
} from "./route-support"

function RootLayout() {
  return (
    <AppGuard>
      <Providers>
        <Outlet />
      </Providers>
    </AppGuard>
  )
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <StaticTitle title="選擇社群">
            <HomePage />
          </StaticTitle>
        ),
      },
      {
        path: "login",
        element: (
          <StaticTitle title="登入">
            <LoginPage />
          </StaticTitle>
        ),
      },
      {
        path: "admin/:admin_department_id",
        element: (
          <AdminTitleLayout>
            <AdminDashboard />
          </AdminTitleLayout>
        ),
      },
      {
        path: ":department_id",
        element: <DepartmentTitleLayout />,
        children: [
          { index: true, element: <DepartmentPage /> },
          {
            path: ":course_id",
            element: <CourseTitleLayout />,
            children: [
              { index: true, element: <CoursePage /> },
              {
                path: ":post_id",
                element: (
                  <PostTitleLayout>
                    <PostPage />
                  </PostTitleLayout>
                ),
              },
              { path: "thread", element: <ThreadListPage /> },
              { path: "thread/:thread_id", element: <ThreadDetailPage /> },
            ],
          },
        ],
      },
      {
        path: "*",
        element: (
          <StaticTitle title="找不到頁面">
            <NotFoundPage />
          </StaticTitle>
        ),
      },
    ],
  },
])
