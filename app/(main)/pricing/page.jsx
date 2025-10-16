"use client"

import PricingModel from '@/components/custom/PricingModel';
import { UserDetailContext } from '@/context/UserDetailContext'
import React, { Suspense, useContext } from 'react'

const Pricing = ({searchParams}) => {
  const { userDetail } = useContext(UserDetailContext);
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 text-slate-100">
      {/* Heading */}
      <header className="space-y-4">
        <h2 className="text-3xl font-semibold tracking-tight">
          Pricing
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
          Start with a free account to speed up your workflow on public projects or boost your entire team with instantly-opening production environments.
        </p>
      </header>

      {/* Token status card */}
      <section
        className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md"
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-lg font-medium">
            {userDetail?.token} Tokens left
          </h2>
          <h2 className="text-lg font-medium">
            Last Purchased Plan: {userDetail?.current_plan}
          </h2>
          <div className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3">
            <h3 className="text-sm font-medium">Need more token?</h3>
            <p className="text-xs text-slate-300">Upgrade your plan now</p>
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <Suspense fallback={null}>
        <PricingModel />
      </Suspense>
    </div>
  )
}

export default Pricing
