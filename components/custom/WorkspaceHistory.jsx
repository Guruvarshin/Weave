"use client";

import { UserDetailContext } from "@/context/UserDetailContext";
import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSidebar } from "../ui/sidebar";
import Link from "next/link";

const WorkspaceHistory = () => {
  const { userDetail } = useContext(UserDetailContext);
  const convex = useConvex();
  const [workspaceList, setWorkspaceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    if (!userDetail?._id) return;
    (async () => {
      setLoading(true);
      const result = await convex.query(api.workspace.GetAllWorkspace, {
        userId: userDetail._id,
      });
      setWorkspaceList(result || []);
      setLoading(false);
    })();
  }, [userDetail, convex]);

  const formatted = useMemo(
    () =>
      (workspaceList || []).map((ws) => {
        const title = ws?.messages?.[0]?.content?.trim() || "New Chat";
        const ts = ws?.updatedAt ?? ws?._creationTime;
        const when = ts
          ? new Date(ts).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })
          : undefined;
        return { ...ws, title, when };
      }),
    [workspaceList]
  );

  return (
    <div className="space-y-3">
      <h2 className="px-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400/90">
        Your Chats
      </h2>

      {loading && (
        <div className="space-y-2 px-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      )}

      {!loading && (
        <ul className="space-y-1 max-h-[50vh] overflow-auto px-2">
          {formatted.length > 0 ? (
            formatted.map((ws) => (
              <li key={ws._id}>
                <Link
                  href={`/workspace/${ws._id}`}
                  onClick={toggleSidebar}
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-slate-100 transition will-change-transform hover:-translate-y-[1px] hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
                  title={ws.title}
                >
                  <span
                    aria-hidden
                    className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-slate-200 shadow-sm transition group-hover:bg-white/20"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M20 2H4a2 2 0 0 0-2 2v16l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
                    </svg>
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate leading-5">{ws.title}</p>
                    {ws.when && (
                      <p className="text-[11px] leading-4 text-slate-400">{ws.when}</p>
                    )}
                  </div>

                  <span aria-hidden className="opacity-40 transition group-hover:opacity-70">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M9.29 6.71a1 1 0 0 0 0 1.41L12.17 11l-2.88 2.88a1 1 0 1 0 1.42 1.41l3.59-3.59a1 1 0 0 0 0-1.41L10.71 6.7a1 1 0 0 0-1.42.01z" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))
          ) : (
            <li>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-400">
                No chats yet.{" "}
                <Link
                  href="/"
                  className="font-medium text-sky-300 underline underline-offset-4 hover:text-sky-200"
                >
                  Start a new chat
                </Link>
              </div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default WorkspaceHistory;
