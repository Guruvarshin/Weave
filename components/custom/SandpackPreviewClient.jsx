import React, { useContext, useEffect, useRef } from 'react'
import { SandpackPreviewRef, useSandpack, SandpackPreview } from "@codesandbox/sandpack-react"
import { ActionContext } from '@/context/ActionContext';
import { toast } from 'sonner';
const SandpackPreviewClient = () => {
  const { sandpack } = useSandpack();
  const previewRef = useRef();
  const {action,setAction}=useContext(ActionContext);
  
  useEffect(()=>{
    if (!sandpack || !action?.timeStamp) return;
    GetSandpackClient();
  },[sandpack && action?.actionType && action?.timeStamp]);

  const GetSandpackClient=async()=>{
    const client = await previewRef?.current?.getClient();
    const result= await client?.getCodeSandboxURL();
    if(result && action?.actionType==='export'){
      window?.open(result?.editorUrl);
    }
    else{    
      toast('Switch to Preview tab and wait till load');
      return;
    }
  }
  return (
   <SandpackPreview
                   style={{ height: '80vh' }}
                   className="rounded-xl border border-white/10 bg-slate-900/60"
                   showNavigator={true}
                    ref={previewRef}
                 />
  )
}

export default SandpackPreviewClient