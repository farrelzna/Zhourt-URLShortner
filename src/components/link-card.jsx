import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Copy, Delete, Download, Trash } from 'lucide-react'

const LinkCard = ({ url, fetchUrls }) => {
    const downloadImage = () => {
        const imageUrl = url?.qr;
        const fileName = url?.title;

            const anchor = document.createElement('a');
            anchor.href = imageUrl;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
    }

    useFetch()

    return (
        <div className='flex flex-col md:flex-row gap-5 border p-4 bg-gray-100 rounded-lg'>
            <img
                src={url?.qr}
                className='h-32 object-contain ring ring-gray-500 self-start'
                alt="qr code" />
            <Link to={`/link/${url?.id}`} className='flex flex-col flex-1'> 
                <span className='text-3xl hover:underline cursor-pointer'>{url?.title}</span>
                <span className='text-3xl text-blue-500 hover:underline cursor-pointer'>                    
                    https://zhourt.in/{url?.custom_url ? url?.custom_url : url.short_url}
                </span>
                <span className='flex items-center gap-1 hover:underline cursor-pointer'>{url.original_url}</span>
                <span className='fkex items-end font-extralight text-sm flex-1'>{new Date(url.created_at).toLocaleString()}</span>
            </Link>

            <div className='flex gap-2'>
                <Button variant={"ghost"} onClick={() => navigator.clipboard.writeText(`https://zhourt.in/${url?.short_url}`)}><Copy /></Button>
                <Button variant={"ghost"} onClick={downloadImage}><Download /></Button>
                <Button variant={"ghost"} onClick={() => {/* delete logic */}}><Trash /></Button>
            </div>
        </div>
    )
}

export default LinkCard