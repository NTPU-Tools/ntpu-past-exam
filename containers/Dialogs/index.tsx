import Dynamic from "next/dynamic";

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

const Dialogs = () => (
  <>
    <CreatePostDialog />
    <UpdatePostStatusDialog />
    <UpdateUserStatusDialog />
    <EditCourseDialog />
  </>
);

export default Dialogs;
