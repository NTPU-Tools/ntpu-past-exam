import Dynamic from "next/dynamic";
import { useRouter } from "next/router";

const UpdateUserStatusDialog = Dynamic(
  () => import("@/containers/Dialogs/UpdateUserStatusDialog"),
  {
    ssr: false,
  },
);

const UpdatePostStatusDialog = Dynamic(
  () => import("@/containers/Dialogs/UpdatePostStatusDialog"),
  {
    ssr: false,
  },
);

const CreatePostDialog = Dynamic(
  () => import("@/containers/Dialogs/CreatePostDialog"),
  {
    ssr: false,
  },
);

const EditCourseDialog = Dynamic(
  () => import("@/containers/Dialogs/EditCourseDialog"),
  {
    ssr: false,
  },
);

const EditBulletinDialog = Dynamic(
  () => import("@/containers/Dialogs/EditBulletinDialog"),
  {
    ssr: false,
  },
);

const Dialogs = () => {
  const { pathname } = useRouter();
  const isAdmin = pathname.includes("admin");

  return (
    <>
      <CreatePostDialog />
      {isAdmin && (
        <>
          <UpdatePostStatusDialog />
          <UpdateUserStatusDialog />
          <EditCourseDialog />
          <EditBulletinDialog />
        </>
      )}
    </>
  );
};

export default Dialogs;
