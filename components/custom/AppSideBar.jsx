"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Image from 'next/image'
import { Button } from '../ui/button'
import { MessageCircleCode } from 'lucide-react'
import WorkspaceHistory from './WorkspaceHistory'
import SideBarFooter from "./SideBarFooter"
import { redirect } from "next/navigation"

const AppSideBar = () => {
  return (
    <Sidebar className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <SidebarHeader className="p-5">
        <div className="inline-flex items-center gap-3">
          <div className="rounded-2xl p-[2px] bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500">
            <div className="rounded-2xl bg-slate-950 p-1">
              <Image src={'/logo.png'} alt='logo' width={30} height={30} className="rounded-xl" />
            </div>
          </div>
          <span className="text-sm font-medium text-slate-300">Weave</span>
        </div>
        <Button
        onClick={()=>redirect('/')}
          className="
            w-full justify-center gap-2 rounded-xl
            bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500
            text-white shadow-lg transition hover:brightness-110 mt-10 cursor-pointer
          "
        >
          <MessageCircleCode className="h-4 w-4" />
          Start New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="p-5 space-y-6">

        <SidebarGroup className="space-y-4">
          <WorkspaceHistory />
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SideBarFooter/>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSideBar
