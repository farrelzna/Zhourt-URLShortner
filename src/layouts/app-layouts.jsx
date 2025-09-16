import Navbar from '@/components/navbar'
import React from 'react'
import { Outlet } from 'react-router-dom'

const AppLayout = () => {
  return (
    <div className="relative min-h-screen">
        <main className='min-h-screen container relative z-10'>
            <Navbar />
            <Outlet />
        </main>
    </div>
  )
}

export default AppLayout