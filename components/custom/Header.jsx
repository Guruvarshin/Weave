// -----------------------------------------------------------------------------
// Header.tsx
'use client'

import React, { useContext, useState } from 'react'
import Image from 'next/image'
import { Button } from '../ui/button'
import { UserDetailContext } from '@/context/UserDetailContext'
import { usePathname } from 'next/navigation'
import { useSidebar } from '../ui/sidebar'
import { ActionContext } from '@/context/ActionContext'
import SignInDialog from './SignInDialog'

// Tweaks
// - Consistent container width to match the page (max-w-7xl)
// - Softer background, stronger contrast for content
// - Mobile-friendly spacing & visibility rules
// - Avatar button toggles sidebar on md+; on mobile it just shows the avatar

const Header = () => {
  const { userDetail } = useContext(UserDetailContext)
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar();
  const {action,setAction}=useContext(ActionContext);
  const [openDialog, setOpenDialog]= useState(false);

  const isWorkspaceRoute = pathname?.startsWith('/workspace')
  const isSignedIn = Boolean(userDetail?.name)
  const userInitial = userDetail?.name?.[0]?.toUpperCase() ?? 'U'
  const onActionBtn=(action)=>{
    setAction({
      actionType:action,
      timeStamp:Date.now()
    });
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-md"
      role="banner"
    >
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl p-[2px] bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500">
            <div className="rounded-2xl bg-slate-950 p-1">
              <Image
                src="/logo.png"
                alt="Weave logo"
                width={36}
                height={36}
                priority
                className="rounded-xl shadow-sm"
              />
            </div>
          </div>
          <span className="text-sm font-medium text-slate-300 sm:text-base">Weave</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isWorkspaceRoute && (
            <div className="hidden sm:flex items-center gap-2">
              <Button
              onClick={()=>onActionBtn('export')}
                className="rounded-xl bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 px-3 sm:px-4 text-white shadow-lg transition hover:brightness-110"
                aria-label="Export workspace"
              >
                Export
              </Button>
            </div>
          )}

          {isSignedIn ? (
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/60 text-sm font-semibold text-slate-200 shadow transition hover:border-sky-400/40 hover:text-white"
              aria-label="Toggle user sidebar"
            >
              {userDetail?.picture ? (
                <Image
                  src={userDetail.picture}
                  alt={userDetail?.name ?? 'User avatar'}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span>{userInitial}</span>
              )}
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2">

              <Button
                className="rounded-xl px-4 text-white shadow-lg transition bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
                aria-label="Sign In"
                onClick={()=>setOpenDialog(true)}
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
      <SignInDialog openDialog={openDialog} closeDialog={(v)=>setOpenDialog(v)}/>
    </header>
  )
}

export default Header
