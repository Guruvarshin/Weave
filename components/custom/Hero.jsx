"use client"
import { MessagesContext } from '@/context/MessagesContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { ArrowRight } from 'lucide-react'
import React, { useContext, useState } from 'react'
import SignInDialog from './SignInDialog';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const Hero = () => {
  const [userInput, setUserInput] = useState();
  const suggestions = [
    'Create ToDo App in React',
    'Create Budget Track App',
    'Create Gym Managment Portal Dashboard',
    'Create Quizz App On History',
    'Create Login Signup Screen'
  ];
  const {messages, setMessages} = useContext(MessagesContext);
  const {userDetail, setUserDetail}= useContext(UserDetailContext);
  const [openDialog, setOpenDialog]= useState(false);
  const CreateWorkspace=useMutation(api.workspace.CreateWorkspace);
  const router=useRouter();
  const onGenerate = async(input) => {
    if(!userDetail?.name){
        setOpenDialog(true);
        return;
    }
    if (!userDetail?._id) {
  router.refresh();
}

    if(userDetail?.token<10)
      {
        toast('You only have'+userDetail?.token+'tokens');
        return ;
    }
    const msg={
      role: 'user',
      content: input
    };
    setMessages([msg]);
    console.log(messages);
    const workspaceId=await CreateWorkspace({
      user:userDetail._id,
      messages:[msg]
    });
    console.log(workspaceId);
    router.push('/workspace/'+workspaceId);

  }

  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 shadow-xl">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50">
        <div className="absolute left-1/2 top-[-10%] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full blur-3xl"
             style={{ background:
               'radial-gradient(closest-side, rgba(56,189,248,0.25), rgba(99,102,241,0.18), transparent)' }} />
      </div>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-16 sm:pt-24">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
            What you want to build today?
          </span>
        </h2>
        <p className="mt-4 text-center text-sm leading-relaxed text-slate-300 sm:text-base">
          Prompt, run, edit, and deploy full-stack web apps.
        </p>

        {/* Input Card */}
        <div className="mt-8">
          <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
            <textarea
              placeholder="What you want to build?"
              onChange={(e) => setUserInput(e.target.value)}
              value={userInput}
              className="min-h-[120px] w-full resize-y rounded-xl border border-white/10 bg-slate-900/60 p-4 text-slate-100 placeholder:text-slate-400 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-sky-400/50"
            />
            {userInput && (
              <button
                type="button"
                onClick={() => onGenerate(userInput)}
                className="group inline-flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-sky-500/10 p-3 ring-1 ring-inset ring-white/10 transition hover:bg-sky-500/20 hover:ring-sky-400/40"
                aria-label="Generate"
                title="Generate"
              >
                <ArrowRight className="h-6 w-6 transition group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>

        {/* Suggestions */}
        <div className="mx-auto mt-8 max-w-3xl">
          <div className="flex flex-wrap justify-center gap-3">
            {suggestions.map((suggestion, index) => {
              return (
                <h2
                  key={index}
                  onClick={() => {onGenerate(suggestion); setUserInput(suggestion)}}
                  className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white"
                >
                  {suggestion}
                </h2>
              )
            })}
          </div>
        </div>
      </section>
      <SignInDialog openDialog={openDialog} closeDialog={(v)=>setOpenDialog(v)}/>
    </div>
  )
}

export default Hero
