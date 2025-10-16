"use client"

import { UserDetailContext } from '@/context/UserDetailContext'
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import React, { useContext, useEffect, useState } from 'react'
import { useSidebar } from '../ui/sidebar';
import Link from 'next/link';

const WorkspaceHistory = () => {
  const { userDetail } = useContext(UserDetailContext);
  const convex = useConvex();
  const [workspaceList, setWorkspaceList] = useState([]);
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    userDetail && GetAllWorkspaces();
  }, [userDetail]);

  const GetAllWorkspaces = async () => {
    const result = await convex.query(api.workspace.GetAllWorkspace, {
      userId: userDetail?._id
    });
    setWorkspaceList(result);
  }

  return (
    <div className="space-y-3">
      <h2 className="px-2 text-xs font-medium uppercase tracking-wider text-slate-400">
        Your Chats
      </h2>

      <div className="space-y-2">
        {workspaceList && workspaceList?.map((ws, index) => (
          <Link href={'/workspace/' + ws?._id} key={index}>
            <h2
              onClick={toggleSidebar}
              className="
                cursor-pointer truncate rounded-xl border border-grey
                bg-black px-3 py-2 text-sm text-slate-200 shadow-sm
                transition hover:-translate-y-0.5 hover:bg-grey hover:text-white
                focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 mb-2
              "
              title={ws?.messages?.[0]?.content}
            >
              {ws?.messages?.[0]?.content || 'New Chat'}
            </h2>
          </Link>
        ))}
        {!workspaceList?.length && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400">
            No chats yet
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkspaceHistory