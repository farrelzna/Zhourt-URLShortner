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
import { LinkIcon, Copy, Download, Trash, ExternalLink, Calendar, BarChart3, MapPin, Smartphone } from "lucide-react";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import { useNavigate, useParams } from "react-router-dom"
import { BarLoader, BeatLoader } from "react-spinners";
import Location from '@/components/location-stats';
import DeviceStat from '@/components/device-stats';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://zhourt.in/${link}`);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Loading Bar */}
      {(loading || loadingStats) && (
        <div className="mb-6">
          <BarLoader width={"100%"} color="rgb(107 114 128)" />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Link Details
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Link Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Link Card */}
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {url?.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Created {new Date(url?.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-0">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Short URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Short URL
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <a
                    href={`https://zhourt.in/${link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    https://zhourt.in/{link}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Original URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Original URL
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <LinkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <a
                    href={url?.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white truncate"
                  >
                    {url?.original_url}
                  </a>
                  <ExternalLink className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadImage}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download QR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fnDelete()}
                  disabled={loadingDelete}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  {loadingDelete ? (
                    <BeatLoader color="currentColor" size={12} />
                  ) : (
                    <Trash className="w-4 h-4" />
                  )}
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                <BarChart3 className="w-5 h-5" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats && stats?.length ? (
                <div className="space-y-6">
                  {/* Total Clicks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats?.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Clicks
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {new Set(stats?.map(stat => stat.ip)).size}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Unique Visitors
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round((stats?.length / Math.max(1, Math.ceil((new Date() - new Date(url?.created_at)) / (1000 * 60 * 60 * 24)))) * 100) / 100}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Avg Daily Clicks
                      </div>
                    </div>
                  </div>

                  {/* Location Data */}
                  <div>
                    <h4 className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white mb-4">
                      <MapPin className="w-4 h-4" />
                      Location Analytics
                    </h4>
                    <Location stats={stats} />
                  </div>

                  {/* Device Info */}
                  <div>
                    <h4 className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white mb-4">
                      <Smartphone className="w-4 h-4" />
                      Device Analytics
                    </h4>
                    <DeviceStat stats={stats} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {loadingStats ? "Loading analytics..." : "No clicks yet"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Share your link to start collecting data
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QR Code */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <img
                  src={url?.qr}
                  alt="QR Code"
                  className="w-48 h-48 object-contain bg-white rounded-lg p-2 border border-gray-200 dark:border-gray-600"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                  Scan to visit your shortened URL
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadImage}
                  className="mt-3 w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Link
