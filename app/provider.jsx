// Provider.tsx
'use client'

import Header from '@/components/custom/Header'
import { UserDetailContext } from '@/context/UserDetailContext'
import React, { useEffect, useState } from 'react'
import { MessagesContext } from '@/context/MessagesContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useConvex } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSideBar from '@/components/custom/AppSideBar'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { ActionContext } from '@/context/ActionContext'
import { useRouter } from 'next/navigation'


const Provider = ({ children }) => {
  const [messages, setMessages] = useState([])
  const [loadingUser, setLoadingUser] = useState(true);
  const [userDetail, setUserDetail] = useState(null);
  const convex = useConvex();
  const [action, setAction] = useState();
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      await isAuthenticated();
      setLoadingUser(false);
    };
    run();
  }, [])

  const isAuthenticated = async () => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('user')
        if (!raw) {
          router.push('/');
        }
        const user = JSON.parse(raw);
        if (!user?.email) return;

        const result = await convex.query(api.users.GetUser, {
          email: user.email,
        })
        setUserDetail(result);
        return;
      } catch (err) {
        console.error('Auth check failed:', err)
      }
    }
  }
  if (loadingUser) {
    return <div className="flex h-screen items-center justify-center text-slate-300">Loading…</div>;
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID_KEY ?? ''}>
      <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '' }}>
        <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
          <MessagesContext.Provider value={{ messages, setMessages }}>
            <ActionContext.Provider value={{ action, setAction }}>
              <SidebarProvider defaultOpen={false}>
                {/* Page chrome */}
                <div className="min-h-screen bg-[radial-gradient(75%_50%_at_50%_0%,#0B1220_0%,#020617_100%)] text-slate-200 w-full">
                  {/* Top bar */}
                  <Header />

                  {/* Body */}
                  <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-6 py-6 md:flex-row md:gap-8">
                      {/* Sidebar */}
                      <AppSideBar />

                      {/* Main content */}
                      <main className="min-h-[60vh] flex-1 rounded-3xl border border-white/10 bg-slate-900/40 p-4 sm:p-6 lg:p-8 shadow-[0_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
                        {children}
                      </main>
                    </div>
                  </div>
                </div>
              </SidebarProvider>
            </ActionContext.Provider>
          </MessagesContext.Provider>
        </UserDetailContext.Provider>
      </PayPalScriptProvider>
    </GoogleOAuthProvider>
  )
}

export default Provider

