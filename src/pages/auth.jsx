import { useNavigate, useSearchParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SignIn from "@/components/signIn";
import SignUp from "@/components/signUp";
import { UrlState } from "@/context";
import { useEffect } from "react";

const Auth = () => {

  const [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");
  const navigate = useNavigate();

  const {isAuthenticated, loading} = UrlState();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
    }
  }, [isAuthenticated, loading])

  return (
    <div className="mt-20 flex flex-col items-center gap-10">
      <h1 className="text-5xl">
        {longLink ? "Hold on!, let's create your account" : "Sign in / Sign up"}
      </h1>
      <Tabs default-value="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">
            Sign In
          </TabsTrigger>
          <TabsTrigger value="signup">
            Sign Up
          </TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <SignIn />
        </TabsContent>
        <TabsContent value="signup">
          <SignUp />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Auth