import Header from '@/components/header'
import React from 'react'
import { Outlet } from 'react-router-dom'

const AppLayout = () => {
  return (
    <div>
        <main className='min-h-screen container'>
            <Header />
            <Outlet />
        </main>
        <div className='p-10 text-center text-sm text-gray-500 mt-10'>
            <p>Made with farelzna</p>
        </div>
    </div>
  )
}

export default AppLayout