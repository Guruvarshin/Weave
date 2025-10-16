import { LogOutIcon, Wallet } from 'lucide-react'
import React, { useContext } from 'react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { UserDetailContext } from '@/context/UserDetailContext'
import { useSidebar } from '../ui/sidebar'

const SideBarFooter = () => {
    const router=useRouter();
    const {userDetail,setUserDetail}=useContext(UserDetailContext);
    const {toggleSidebar}=useSidebar();
    const options=[
        {
            name:'My Subscription',
            icon: Wallet,
            path: '/pricing'
        },
        {
            name:'Sign Out',
            icon: LogOutIcon,
            path:null
        }
    ];
    const onOptionClick=(option)=>{
        if(!option?.path){
            setUserDetail(null);
            localStorage.removeItem('user');
            router.push('/');
            toggleSidebar();
            return;
        }
        router.push(option.path);
    }
  return (
    <div className='p-2 mb-10'>
        {options?.map((opt,ind)=>(
            <Button 
            onClick={()=>onOptionClick(opt)}
            className='w-full flex justify-start my-3 cursor-pointer' key={ind}>
                <opt.icon/>
                {opt.name}
            </Button>
        ))}
    </div>
  )
}

export default SideBarFooter