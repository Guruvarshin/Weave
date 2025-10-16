"use client"

import { MessagesContext } from '@/context/MessagesContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import { useConvex, useMutation } from 'convex/react';
import { useParams } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';
import Prompt from '@/data/Prompt';
import Markdown from 'react-markdown';
import { useSidebar } from '../ui/sidebar';

export const countToken=(inputText)=>{
  return inputText.trim().split(/\s+/).filter(word=>word).length;
};

const ChatView = () => {
  const { id } = useParams();
  const convex = useConvex();
  const { messages, setMessages } = useContext(MessagesContext);
  const { userDetail,setUserDetail } = useContext(UserDetailContext);
  const [userInput,setUserInput]=useState();
  const [loading,setLoading]=useState(false);
  const UpdateMessages= useMutation(api.workspace.UpdateMessages);
  const {toggleSidebar}=useSidebar();
  const UpdateTokens=useMutation(api.users.UpdateToken);

  useEffect(() => {
    id && GetWorkspaceData();
  }, [id]);

  // get workspace using id
  const GetWorkspaceData = async () => {
    const result = await convex.query(api.workspace.GetWorkspace, {
      workspaceId: id
    });
    setMessages(result?.messages || []);
    console.log(result);
  }

  useEffect(()=>{
    if(messages?.length>0){
        const role=messages[messages?.length-1].role;
        if(role==='user'){
            GetAiResponse();
        }
    }
  },[messages]);

  const GetAiResponse=async()=>{
    setLoading(true);
    const PROMPT=JSON.stringify(messages)+Prompt.CHAT_PROMPT;
    const result=await axios.post('/api/ai-chat',{
        prompt: PROMPT
    });
    const aiResp={
        role:'ai',
        content:result.data.result
    };
    console.log(result);
    const previousMessages = Array.isArray(messages) ? messages : [];
    const updatedMessages = [...previousMessages, aiResp];
    setMessages(updatedMessages);

    await UpdateMessages({
      messages: updatedMessages,
      workspaceId:id
    });
    //update token
    const currentTokens = userDetail?.token || 50000;
    const tokensUsed = countToken(JSON.stringify(aiResp));
    const tok = currentTokens - tokensUsed;

    console.log(tok,userDetail?.token,tokensUsed);

    await UpdateTokens({
      userId:userDetail?._id,
      token:tok
    });
    setUserDetail(prev=>({
      ...prev,
      token:tok
    }));
    setLoading(false);
  }

  const onGenerate=(input)=>{
    if(userDetail?.token>10)
      {
        toast('You dont have enough token');
        return ;
    }
    setMessages(prev=>[...prev,{
      role:'user',
      content:input
    }]);
    setUserInput('');
  }

  return (
    <div className="relative isolate min-h-[100dvh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div
          className="absolute left-1/2 top-[-15%] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(56,189,248,0.16), rgba(99,102,241,0.14), transparent)' }}
        />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Chat container */}
        <div className="rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500" />
          <div className="max-h-[calc(100dvh-260px)] overflow-y-auto space-y-4 p-4 pr-1 scrollbar-hide">
            {messages?.map((msg, index) => {
              const isUser = msg?.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant avatar (left) */}
                  {!isUser && (
                    <div className="shrink-0">
                      <div className="rounded-xl bg-slate-950 p-0.5 ring-1 ring-white/10">
                        <Image
                          src="/logo.png"
                          alt="Weave"
                          width={28}
                          height={28}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`
                      max-w-[78%] rounded-2xl border p-3 text-sm leading-relaxed shadow-sm
                      ${isUser
                        ? 'bg-gradient-to-br from-sky-500/15 to-indigo-500/15 border-sky-400/30 text-slate-100'
                        : 'bg-white/5 border-white/10 text-slate-100'}
                    `}
                  >
                    {/* react-markdown styled via wrapper */}
                    <div className="prose prose-invert prose-slate max-w-none prose-p:my-2 prose-pre:bg-slate-900/70 prose-code:text-sky-300">
                      <Markdown>
                        {msg.content}
                      </Markdown>
                    </div>
                  </div>

                  {/* User avatar (right) */}
                  {isUser && (
                    <div className="shrink-0">
                      {userDetail?.picture ? (
                        <Image
                          src={userDetail.picture}
                          alt="User"
                          width={32}
                          height={32}
                          className="rounded-full ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 ring-1 ring-white/10" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty state */}
            {!messages?.length && (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-slate-400">
                <Image src="/logo.png" alt="Weave" width={40} height={40} className="rounded-xl opacity-80" />
                <p className="text-sm">No messages yet. Start by sending a prompt!</p>
              </div>
            )}

            {/* Loading state bubble (styling only) */}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-slate-950 p-0.5 ring-1 ring-white/10">
                  <Image src="/logo.png" alt="Weave" width={28} height={28} className="rounded-lg" />
                </div>
                <div className="max-w-[78%] rounded-2xl border border-white/10 bg-white/5 p-3 text-sm shadow-sm">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.2s]" />
                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.1s]" />
                    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-slate-300" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="mt-8">
        {userDetail && (
          <div className="mx-auto mb-2 flex max-w-2xl items-center gap-2 px-1 text-slate-300">
            <Image src={userDetail?.picture} alt="user" width={24} height={24} className="rounded-full ring-1 ring-white/10 cursor-pointer" onClick={toggleSidebar} />
            <span className="text-xs">Signed in</span>
          </div>
        )}
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
    </div>
  )
}

export default ChatView
