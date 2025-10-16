"use client"

import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import Lookup from '@/data/Lookup';
import axios from 'axios';
import { MessagesContext } from '@/context/MessagesContext';
import Prompt from '@/data/Prompt';
import { useConvex, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import { Loader2Icon, LoaderIcon } from 'lucide-react';
import { UserDetailContext } from '@/context/UserDetailContext';
import { countToken } from './ChatView';
import SandpackPreviewClient from './SandpackPreviewClient';
import { ActionContext } from '@/context/ActionContext';

const CodeView = () => {
  const {id}=useParams();
  const [activeTab, setActiveTab]=useState('code');
  const [files,setFiles]=useState(Lookup.DEFAULT_FILE);
  const {messages,setMessages}=useContext(MessagesContext);
  const {userDetail,setUserDetail}=useContext(UserDetailContext);
  const UpdateFiles=useMutation(api.workspace.UpdateFiles);
  const convex=useConvex();
  const [loading,setLoading]=useState(false);
  const lastHandledMessageRef = useRef(null);
  const UpdateTokens=useMutation(api.users.UpdateToken);
  const {action,setAction}=useContext(ActionContext);

  useEffect(()=>{
    id && GetFiles();
  },[id]);

  useEffect(()=>{
    setActiveTab('preview');
  },[action]);

  const GetFiles=async()=>{
    setLoading(true);
    const result= await convex.query(api.workspace.GetWorkspace,{
      workspaceId:id
    });
    const mergedFiles={...Lookup.DEFAULT_FILE,...result?.fileData};
    console.log("Get"+mergedFiles);
    setFiles(mergedFiles);
    setLoading(false);
  }

  useEffect(()=>{
    if(messages?.length>0){
      const lastMessage = messages[messages.length - 1];
      const fingerprint = lastMessage ? `${lastMessage.role}:${lastMessage.content}` : null;
      if(
        lastMessage?.role === 'user' &&
        fingerprint &&
        lastHandledMessageRef.current !== fingerprint
      ){
        lastHandledMessageRef.current = fingerprint;
        GenerateAiCode();
      }
    }
  },[messages]);

  const GenerateAiCode=async()=>{
    try{
      setLoading(true);
      const PROMPT=JSON.stringify(messages)+" "+Prompt.CODE_GEN_PROMPT;
      const result=await axios.post('/api/gen-ai-code',{
        prompt:PROMPT,
        messages:messages
      });
      const aiResp=result.data;
      console.log(aiResp);
      const mergedFiles={...Lookup.DEFAULT_FILE, ...aiResp?.files};
      console.log(mergedFiles);
      setFiles(mergedFiles);
      await UpdateFiles({
        workspaceId:id,
        files:aiResp?.files
      });
      
      const currentTokens = userDetail?.token || 50000;
      const tokensUsed = countToken(JSON.stringify(aiResp));
      const tok = currentTokens - tokensUsed;
      
      await UpdateTokens({
            userId:userDetail?._id,
            token:tok
          });
          setUserDetail(prev=>({
      ...prev,
      token:tok
    }));
    } catch (error){
      console.error("GenerateAiCode failed", error);
      lastHandledMessageRef.current = null;
    } finally{
      setLoading(false);
    }
  }

  return (
    <div className="relative isolate rounded-2xl p-4 text-slate-100
                    bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Ambient texture */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-1/2 top-[-18%] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full blur-3xl"
             style={{background:'radial-gradient(closest-side, rgba(56,189,248,.18), rgba(99,102,241,.15), transparent)'}} />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[length:18px_18px] opacity-[0.18]" />
      </div>

      {/* Top bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 shadow-sm backdrop-blur">
            <h2
              onClick={()=>setActiveTab('code')}
              role="tab"
              aria-selected={activeTab === 'code'}
              className={`cursor-pointer select-none rounded-lg px-4 py-2 text-sm transition
                ${activeTab === 'code'
                  ? 'bg-white/10 text-white ring-1 ring-inset ring-white/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
            >
              Code
            </h2>
            <h2
              onClick={()=>setActiveTab('preview')}
              role="tab"
              aria-selected={activeTab === 'preview'}
              className={`cursor-pointer select-none rounded-lg px-4 py-2 text-sm transition
                ${activeTab === 'preview'
                  ? 'bg-white/10 text-white ring-1 ring-inset ring-white/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
            >
              Preview
            </h2>
          </div>
        </div>
      </div>

      <SandpackProvider
        files={files}
        template="react"
        theme={'dark'}
        customSetup={{ dependencies:{ ...Lookup.DEPENDANCY } }}
        options={{ externalResources:['https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'] ,activeFile: '/App.js'}}
      >
        <SandpackLayout
          className="rounded-2xl border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur overflow-hidden"
        >
          {activeTab==='code' ?
            <>
              <SandpackFileExplorer
                style={{ height: '80vh' }}
                className="min-w-[230px] border-r border-white/10 bg-slate-900/70"
              />
              <SandpackCodeEditor
                style={{ height: '80vh' }}
                className="bg-slate-900/60"
                showLineNumbers
                extensions={[autocompletion()]}
        extensionsKeymap={[completionKeymap]}
              />
            </>
            :
            <div className="w-full">
              <SandpackPreviewClient/>
            </div>
          }
        </SandpackLayout>
      </SandpackProvider>

      {/* Loader overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 shadow-xl">
            <Loader2Icon className="h-6 w-6 animate-spin text-white" />
            <h2 className="text-sm text-white/90">Generating Files…</h2>
          </div>
        </div>
      )}
    </div>
  )
}

export default CodeView
