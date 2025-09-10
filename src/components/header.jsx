import { Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { AvatarImage } from '@radix-ui/react-avatar';
import { LinkIcon, LogOut } from 'lucide-react';


const Header = () => {

  const navigate = useNavigate();
  const user = false;

  return (
    <nav className='py-4 justify-between items-center flex'>
      <Link to="/">
        <img src="/logo.png" alt="Indosiar" className="h-16 " />
      </Link>

      <div>
        {!user ?
          <Button onClick={() => navigate("/auth")}>Login</Button>
          : (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src="https://github.com/unovue.png" alt="@unovue" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Jeidencn</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LinkIcon className="mr-2 h-4 w-4"/>
                    <span>My Links</span>
                  </DropdownMenuItem>
                <DropdownMenuItem className='text-red-400'>
                  <LogOut className="mr-2 h-4 w-4"/>
                  <span>Log Out</span>
                </DropdownMenuItem>                
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      </div>
    </nav>
  )
}

export default Header