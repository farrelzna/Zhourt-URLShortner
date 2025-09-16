import { useNavigate, useSearchParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SignIn from "@/components/signIn";
import SignUp from "@/components/signUp";
import { UrlState } from "@/context";
import { useEffect } from "react";
import { Link2 } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
              <Link2 className="w-6 h-6 text-white dark:text-gray-900" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Zhourt</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {longLink ? "Almost there!" : "Welcome back"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {longLink 
              ? "Create your account to shorten your URL" 
              : "Sign in to your account or create a new one"
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger value="signin" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="mt-0">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Sign in to your account
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Access your dashboard and manage your links
                    </p>
                  </div>
                  <SignIn />
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Create new account
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Start shortening URLs and track analytics
                    </p>
                  </div>
                  <SignUp />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth