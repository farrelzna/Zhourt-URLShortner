import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UrlState } from "@/context";
import { getClicksForUrl } from "@/db/apiClicks";
import { deleteUrls, getUrl } from "@/db/apiUrls";
import usFetch from "@/hooks/use-fetch";
import { LinkIcon } from "lucide-react";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import { useNavigate, useParams } from "react-router-dom"
import { BarLoader } from "react-spinners";
import { Copy, Download, Trash } from 'lucide-react'
import Location from '@/components/location-stats';
import { Button } from '@/components/ui/button';

const Link = () => {
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
  const { id } = useParams();
  const { user } = UrlState();
  const navigate = useNavigate();

  const {
    loading,
    data: url,
    fn,
    error,
  } = usFetch(getUrl, { id, user_id: user?.id });

  const {
    loading: loadingStats,
    data: stats,
    fn: fnStats
  } = useFetch(getClicksForUrl, id);

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrls, id);

  useEffect(() => {
    fn();
    fnStats();
  }, []);

  if (error) {
    navigate("/dashboard");
  }

  let link = "";
  if (url) {
    link = url?.custom_url ? url?.custom_url : url.short_url
  }

  return (
    <>
      {(loading || loadingStats) && (
        <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
      )}
      <div className="flex flex-col gap-8 sm:flex-row justify-between">
        <div className="flex flex-col items-start gap-8 rounded-lg sm:w-2/5">
          <span className="text-6xl hover:underline cursor-pointer">
            {url?.title}
          </span>
          <a
            href={`https://zhourt.in/${link}`}
            target="_blank"
            className="text-3xl sm:text-4xl text-blue-400 hover:underline cursor-pointer"
          >
            {`https://zhourt.in/${link}`}
          </a>
          <a
            href={url?.original_url}
            target="_blank"
            className="flex items-center gap-1 hover:underline cursor-pointer"
          >
            <LinkIcon className="p-1 border rounded" />
            {url?.original_url}
          </a>
          <span className="flex items-center font-extralight text-sm">
            {new Date(url?.created_at).toLocaleString()}
          </span>
        </div>
        <div className='flex gap-2'>
          <Button variant={"ghost"} onClick={() => navigator.clipboard.writeText(`https://zhourt.in/${url?.short_url}`)}><Copy /></Button>
          <Button variant={"ghost"} onClick={downloadImage}><Download /></Button>
          <Button variant={"ghost"} onClick={() => fnDelete()}>
            {loadingDelete ? <BeatLoader color="#FF0000" size={5} /> : <Trash />}
          </Button>
        </div>
        <img
          src={url?.qr}
          alt="qr code"
          className="w-full self-center sm:self-start ring ring-blue-500 p-1 object-contain"
        />
      </div>
      <div className="sm:w-3/5">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-medium">Stats</CardTitle>
          </CardHeader>
          {stats && stats?.length ? (
            <CardContent className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{stats?.length}</p>
                </CardContent>
              </Card>

              <CardTitle>Location Data</CardTitle>
              <Location stats={stats} />
              <CardTitle>Device Info</CardTitle>
              <DeviceStat stats={stats} />
            </CardContent>
          ) : (
            <CardContent>
              {loadingStats === false
                ? "No Statistics yet"
                : "Loading Statistics"
              }
            </CardContent>
          )}

        </Card>
      </div>
    </>
  )
}

export default Link
