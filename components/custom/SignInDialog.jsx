import React, { useContext } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '../ui/button'
import { useGoogleLogin } from '@react-oauth/google'
import { UserDetailContext } from '@/context/UserDetailContext'
import axios from 'axios'
import { useMutation } from 'convex/react'
import uuid4 from 'uuid4'
import { api } from '@/convex/_generated/api'

const SignInDialog = ({ openDialog, closeDialog }) => {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const CreateUser= useMutation(api.users.CreateUser);
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log(tokenResponse);
      const userInfo = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: 'Bearer ' + tokenResponse?.access_token } },
      );
      console.log(userInfo);
      //Save it it database
      const user=userInfo?.data;
      const dbUser = await CreateUser({name:user?.name, email:user?.email, picture: user?.picture, uid: uuid4()});
      const storedUser = dbUser ?? userInfo?.data;
      if(typeof window!==undefined && storedUser){
        localStorage.setItem('user',JSON.stringify(storedUser));
      }
      if (dbUser) {
        setUserDetail(dbUser);
      } else {
        setUserDetail(prev => ({
          ...prev,
          ...userInfo?.data,
        }));
      }
      closeDialog(false);
    },
    onError: errorResponse => console.log(errorResponse),
  });

  return (
    <Dialog open={openDialog} onOpenChange={closeDialog}>
      <DialogContent
        className="
          sm:max-w-md rounded-2xl border border-white/10
          bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950
          text-slate-200 shadow-2xl backdrop-blur-xl
          p-0 overflow-hidden
        "
      >
        {/* Accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500" />

        <DialogHeader className="p-6">
          <DialogTitle className="sr-only"></DialogTitle>

          <DialogDescription className="space-y-6">
            {/* Heading */}
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                Continue with Weave
              </h2>
              <p className="text-sm text-slate-400">
                To use Weave you must log into an existing account or create one.
              </p>
            </div>

            {/* Google Button */}
            <div className="px-1">
              <Button
                onClick={googleLogin}
                aria-label="Sign in with Google"
                className="
                  w-full justify-center gap-2 rounded-xl
                  bg-white text-slate-900 hover:bg-slate-100
                  border border-slate-200 shadow-sm
                "
              >
                {/* Google 'G' icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.913 31.91 29.333 35 24 35 16.82 35 11 29.18 11 22S16.82 9 24 9c3.59 0 6.845 1.356 9.318 3.571l5.657-5.657C35.994 3.053 30.268 1 24 1 10.745 1 0 11.745 0 25s10.745 24 24 24 24-10.745 24-24c0-1.627-.17-3.215-.389-4.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.4 16.018 18.848 13 24 13c3.59 0 6.845 1.356 9.318 3.571l5.657-5.657C35.994 3.053 30.268 1 24 1 15.329 1 7.937 5.614 3.694 12.306z"/>
                  <path fill="#4CAF50" d="M24 49c6.137 0 11.74-2.347 15.922-6.172l-6.957-5.884C30.61 38.282 27.5 39 24 39c-5.3 0-9.86-3.055-12.02-7.49l-6.53 5.027C8.615 43.85 15.77 49 24 49z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.307 3.05-4.157 5.354-7.338 6.264l6.957 5.884C37.69 37.86 40.5 32.5 40.5 25c0-1.627-.17-3.215-.389-4.917z"/>
                </svg>
                Sign In With Google
              </Button>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Footnote */}
            <p className="text-center text-xs leading-relaxed text-slate-400">
              By using Weave, you agree to the collection of usage data for analytics.
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default SignInDialog
