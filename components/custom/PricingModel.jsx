'use client'

import Lookup from '@/data/Lookup'
import React, { useContext, useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { UserDetailContext } from '@/context/UserDetailContext';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner';
const STORAGE_KEY = 'weave:selectedOption'

const PricingModel = () => {
  const {userDetail,setUserDetail}= useContext(UserDetailContext);
  const UpdateToken = useMutation(api.users.UpdateToken);
  const [selectedOption, setSelectedOption] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get('customer_session_token');

  useEffect(() => {
    if (!sessionToken) return;
    if (!userDetail?._id) return;
    if (typeof window === 'undefined') return;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setCheckoutError('Checkout succeeded, but plan data was missing.');
      router.replace('/pricing');
      return;
    }

    try {
      const stored = JSON.parse(raw);
      setSelectedOption(stored);
      onPaymentSuccess(stored);
    } catch (error) {
      console.error('Failed to parse stored pricing option:', error);
      setCheckoutError('Failed to read stored plan.');
    } finally {
      router.replace('/pricing');
    }
  }, [sessionToken, userDetail?._id, router]);

  const onPriceSelection = async (pricing) => {
    setSelectedOption(pricing);
    setCheckoutError(null);
    if (!userDetail?.email) {
      setCheckoutError('User email is required to start checkout.');
      return;
    };
    if (typeof window !== 'undefined') {
      // Persist selected plan so we can recover it after the checkout redirect
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(pricing)
      );
    }
    setLoadingPlan(pricing.name);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan: pricing?.name,
          email: userDetail.email
        })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error ?? 'Checkout request failed.');
      }
      if (!result?.url) {
        throw new Error('Checkout URL missing from response.');
      }
      window.location.assign(result.url);
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message);
    } finally {
      setLoadingPlan(null);
    }

  }
  const onPaymentSuccess = async (plan = selectedOption) => {
    toast('Payment Successful');
    if (!userDetail?._id || !plan) {
      console.log(userDetail,plan);
      console.warn('Unable to update token balance without user detail and plan selection.');
      return;
    }
    const token = Number(userDetail?.token ?? 0) + Number(plan?.value ?? 0);
    console.log(token,plan);
    await UpdateToken({
      token: token,
      current_plan:plan?.name,
      userId: userDetail._id
    });
    setUserDetail(prev=>({
      ...prev,
      token:token
    }));
  };
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Lookup.PRICING_OPTIONS.map((pricing, ind) => (
        <div
          key={ind}
          className="
            group relative rounded-2xl border border-white/10 bg-white/5 p-6
            text-slate-100 shadow-2xl backdrop-blur-md transition
            hover:-translate-y-1 hover:border-sky-400/30 hover:bg-white/10
          "
        >
          {/* Accent */}
          <div className="absolute inset-x-0 top-0 h-1 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 rounded-t-2xl opacity-80" />

          <div className="mt-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">{pricing.name}</h2>
            <span className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
              {pricing.tokens} Tokens
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-300">{pricing.desc}</p>

          <div className="mt-6 flex items-end justify-between">
            <h2 className="text-2xl font-semibold">${pricing.price}</h2>

            <Button
              className="
                rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500
                px-4 py-2 text-white shadow-lg transition hover:brightness-110
              "
              onClick={() => { onPriceSelection(pricing) }}
              disabled={loadingPlan === pricing.name}
            >
              {loadingPlan === pricing.name ? 'Processing...' : `Upgrade to ${pricing.name}`}
            </Button>

          </div>
        </div>
      ))}
      {checkoutError && (
        <p className="sm:col-span-2 lg:col-span-3 text-sm text-red-400">
          {checkoutError}
        </p>
      )}
    </div>
  )
}

export default PricingModel
