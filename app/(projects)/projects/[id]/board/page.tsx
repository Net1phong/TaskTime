"use client";
import { FC } from "react";
import Link from "next/link";
import { filterTasksByUser } from "@/lib/filterTasksByUser";
import { usePData } from "@/hooks/usePData";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";

// Components
import BoardView from "@/app/(projects)/components/BoardView";

interface ProjectsPage {
  params: Params;
}

interface Params {
  id: string;
}

const ProjectsPage: FC<ProjectsPage> = ({ params }) => {
  const user = useUser();
  const { data, loading, error } = usePData({ board_id: params.id });
  const [showUserTasks, setShowUserTasks] = useState(false);

  const totalTasks = data?.lists.reduce(
    (acc, list) => acc + (list.cards?.length || 0),
    0
  );

  const userTaskLists =
    showUserTasks && data?.lists
      ? filterTasksByUser(data.lists, user.id)
      : data?.lists || [];

  return loading ? (
    <div className="flex justify-center">
      <span className="loading loading-ring w-12"></span>
    </div>
  ) : (
    <>
      <div className="flex gap-3">
        <Link
          href={`/projects/${params.id}/board`}
          className="btn btn-primary w-28"
        >
          <i className="fa-regular fa-file-lines"></i> Board
        </Link>
        <Link href={`/projects/${params.id}/timeline`} className="btn w-28">
          <i className="fa-regular fa-clock"></i> Timeline
        </Link>
      </div>
      <div className="divider"></div>
      <div className="flex justify-between mb-5">
        <div className="flex items-center p-4 w-1/2 bg-black/30 rounded-xl">
          <h2 className="font-bold text-white">{data?.title}</h2>
          <span className="ml-3 text-sm">( {totalTasks} task )</span>
        </div>
        <button
          onClick={() => setShowUserTasks(!showUserTasks)}
          className="btn bg-black/50 font-bold h-14"
        >
          <i
            className={`fa-solid fa-user-${showUserTasks ? "group" : "check"}`}
          ></i>
          {showUserTasks ? "All Tasks" : "My Tasks"}
        </button>
      </div>
      <div className="h-full">
        {showUserTasks
          ? userTaskLists.length > 0 && (
              <BoardView data={userTaskLists} board_id={params.id} />
            )
          : data?.lists && <BoardView data={data.lists} board_id={params.id} />}
      </div>
    </>
  );
};

export default ProjectsPage;
