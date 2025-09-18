import useFetch from '@/hooks/use-fetch';
import { logout as signout } from '@/db/apiAuth';
import { BarLoader } from 'react-spinners';
import { UrlState } from '@/context';
import { Link, useNavigate } from 'react-router-dom';
import { LinkIcon, LogOut, Menu, X, Home } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from './ui/button';
import { useState } from 'react';

const Navbar = () => {
  const { loading, fn: fnSignout } = useFetch(signout);
  const navigate = useNavigate();
  const { user, fetchUser } = UrlState();
  const [isOpen, setIsOpen] = useState(false);

  // Navigation items untuk sidebar
  const items = [
    { label: "Home", href: "/", icon: Home },
    ...(user ? [{ label: "My Links", href: "/dashboard", icon: LinkIcon }] : []),
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="absolute right-4 top-4 z-50">
        <Button
          onClick={toggleSidebar}
          className={`w-12 h-12 rounded-full bg-transparent hover:bg-transparent backdrop-blur-xl shadow-none transition-all duration-300 ${
            isOpen ? 'rotate-180 scale-110' : 'hover:scale-105'
          }`}
        >
          {isOpen ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <Menu className="h-5 w-5 text-white" />
          )}
        </Button>
      </div>

      {/* Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-500 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={toggleSidebar}
      />

      {/* Right Sidebar */}
      <div className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 transition-all duration-700 ease-in-out ${
        isOpen 
          ? 'translate-x-0 opacity-100 scale-100 rotate-0' 
          : 'translate-x-full opacity-0 scale-75 rotate-12'
      }`}>
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/30 dark:border-gray-800/30 rounded-2xl shadow-2xl shadow-gray-900/20 dark:shadow-gray-100/10 p-6 w-64 transform transition-all duration-700">
          
          {/* Profile Section */}
          <div className={`transform transition-all duration-500 delay-100 ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            {user ? (
              <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200/20 dark:border-gray-800/20">
                <div className="relative mb-3">
                  <Avatar className="transform transition-all duration-500 hover:scale-110">
                    <AvatarImage 
                      src={user?.user_metadata?.profile_pic || user?.profile_pic} 
                      className="h-12 w-12 rounded-full" 
                    />
                    <AvatarFallback className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-medium shadow-lg">
                      {user?.user_metadata?.name?.charAt(0)?.toUpperCase() || 
                       user?.name?.charAt(0)?.toUpperCase() || 
                       user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                  {user?.user_metadata?.name || user?.name || 'User'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                  {user?.email}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200/20 dark:border-gray-800/20">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mb-3 animate-pulse">
                  <span className="text-gray-400 dark:text-gray-500 text-lg">?</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Not logged in</p>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className={`mb-6 transform transition-all duration-500 delay-200 ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={index} className={`transform transition-all duration-500 ${
                  isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`} style={{ transitionDelay: `${300 + index * 100}ms` }}>
                  <Link
                    to={item.href}
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-300 px-3 py-3 rounded-xl text-sm font-medium w-full group transform hover:scale-105 hover:translate-x-1"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="mr-3 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    <span className="transition-all duration-300">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Action Buttons */}
          <div className={`pt-6 border-t border-gray-200/20 dark:border-gray-800/20 transform transition-all duration-500 delay-300 ${
            isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            {!user ? (
              <Button 
                onClick={() => {
                  navigate("/auth");
                  setIsOpen(false);
                }}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 hover:from-gray-800 hover:to-gray-600 dark:hover:from-gray-100 dark:hover:to-white rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Sign In
              </Button>
            ) : (
              <Button
                onClick={() => {
                  fnSignout().then(() => {
                    fetchUser();
                    navigate("/");
                    setIsOpen(false);
                  });
                }}
                variant="outline"
                className="w-full text-white hover:text-white hover:bg-red-600 dark:hover:bg-red-900/20 hover:border-none rounded-sm text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg group"
              >
                <LogOut className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="fixed top-0 left-0 w-full z-40">
          <BarLoader className='w-full' color="rgb(107 114 128)" />
        </div>
      )}
    </>
  )
}

export default Navbar