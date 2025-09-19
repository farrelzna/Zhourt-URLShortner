import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Calendar, Copy, Download, ExternalLink, Trash, View, Check } from 'lucide-react'
import { deleteUrls } from '@/db/apiUrls'
import useFetch from '@/hooks/use-fetch'
import { BeatLoader } from 'react-spinners'
import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

    const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrls, url?.id)
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://zhourt.gt.tc/${url?.short_url}`).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500); // icon ceklis selama 1.5 detik
        });
    };

    return (
        <div className='flex flex-col md:flex-row gap-5 hover:border hover:border-white/10 p-4 bg-transparent rounded-lg'>
            <img
                src={url?.qr}
                className='h-32 object-contain rounded-sm self-start'
                alt="qr code" />
            <div className='flex flex-col flex-1'>
                <Link to={`/link/${url?.id}`} className='max-w-xs truncate'>
                    <span className='text-3xl font-medium hover:underline cursor-pointer'>{url?.title}</span>
                </Link>
                <Link to={`https://zhourt.gt.tc/${url?.custom_url ? url?.custom_url : url.short_url}`} target="_blank" rel="noopener noreferrer" className='max-w-xs truncate'>
                    <span className='text-2xl text-blue-500 hover:underline cursor-pointer'>https://zhourt.gt.tc/{url?.custom_url ? url?.custom_url : url.short_url}</span>
                </Link>
                <Link to={url?.original_url} target="_blank" rel="noopener noreferrer" className='flex items-center gap-1 max-w-xs truncate group'>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-white/60 group-hover:text-white flex-shrink-0" />
                    <span className='flex items-center gap-1 text-xs hover:underline cursor-pointer'>{url.original_url}</span>
                </Link>
                <div className='flex items-center gap-2 mt-4 sm:mt-6'>
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-white/60 flex-shrink-0" />
                    <span className='text-xs  text-white/60 font-mono'>
                        {new Date(url.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
            </div>

            <div className='flex gap-2'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={() => window.location.href = `/link/${url?.id}`} className="hover:transition-colors hover:text-white/70 hover:bg-transparent">
                      <View />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Details</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={handleCopy}
                      className="hover:transition-colors hover:text-white/70 hover:bg-transparent"
                    >
                      {copied ? <Check className="text-green-400" /> : <Copy />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? "Copied!" : "Copy Link"}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={downloadImage} className="hover:transition-colors hover:text-white/70 hover:bg-transparent">
                      <Download />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download QR</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={() => fnDelete().then(() => fetchUrls())} className="text-red-400 hover:transition-colors hover:text-red-600 hover:bg-transparent">
                      {loadingDelete ? <BeatLoader color="#FF0000" size={5} className="bg-transparent" /> : <Trash />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Link</p>
                  </TooltipContent>
                </Tooltip>
            </div>
            
        </div>
    )
}

export default LinkCard