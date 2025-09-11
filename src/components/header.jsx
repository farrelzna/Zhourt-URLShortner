import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useFetch from '@/hooks/use-fetch';
import { Link, useNavigate } from 'react-router-dom'
import { LinkIcon, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from './ui/button';
import { logout as signout } from '@/db/apiAuth';
import { BarLoader } from 'react-spinners';
import { UrlState } from '@/context';


const Header = () => {
  const { loading, fn: fnSignout } = useFetch(signout);
  const navigate = useNavigate();

  const { user, fetchUser } = UrlState();

  // Debug: Log user object to see its structure
  console.log('User object:', user);

  return (
    <>
      <nav className='py-4 justify-between items-center flex'>
        <Link to="/">
          <img src="/logo.png" alt="Indosiar" className="h-16 " />
        </Link>

        <div>
          {!user ? (
            <Button onClick={() => navigate("/auth")}>Login</Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.profile_pic || user?.profile_pic} />
                  <AvatarFallback>
                    {user?.user_metadata?.name?.charAt(0)?.toUpperCase() || 
                     user?.name?.charAt(0)?.toUpperCase() || 
                     user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                  {user?.user_metadata?.name || user?.name || user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to={"/dashboard"} className="flex items-center">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    My Links
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    fnSignout().then(() => {
                      fetchUser();
                      navigate("/auth");
                    });
                  }}
                  className="text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>
      {loading && <BarLoader className='mb-4' width={"100%"} color="#000" />}
    </>
  )
}

export default Header