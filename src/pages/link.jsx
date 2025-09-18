import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BarLoader, BeatLoader } from "react-spinners";
import { LinkIcon, Copy, Download, Trash, ExternalLink, Calendar, BarChart3, MapPin, Smartphone, Star, ArrowLeft } from "lucide-react";
import { gsap } from 'gsap';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

import { UrlState } from "@/context";
import { getClicksForUrl } from "@/db/apiClicks";
import { deleteUrls, getUrl } from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";
import Location from '@/components/location-stats';
import DeviceStat from '@/components/device-stats';
import Aurora from '@/components/Aurora';
import { useAlertManager, AlertContainer } from '@/components/AlertNotification';

const Link = () => {
  const { id } = useParams();
  const { user } = UrlState();
  const navigate = useNavigate();

  const headerRef = useRef(null);
  const mainCardRef = useRef(null);
  const statsRef = useRef(null);
  const qrRef = useRef(null);

  // Alert Manager
  const { alerts, showAlert, removeAlert } = useAlertManager();

  const {
    loading,
    data: url,
    fn,
    error,
  } = useFetch(getUrl, { id, user_id: user?.id });

  const {
    loading: loadingStats,
    data: stats,
    fn: fnStats
  } = useFetch(getClicksForUrl, id);

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrls, id);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    fn();
    fnStats();
  }, []);

  // Animate on load
  useEffect(() => {
    const tl = gsap.timeline();

    if (headerRef.current) {
      tl.fromTo(headerRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }

    if (mainCardRef.current) {
      tl.fromTo(mainCardRef.current,
        { y: 40, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: "back.out(1.2)" },
        "-=0.6"
      );
    }

    if (statsRef.current && qrRef.current) {
      tl.fromTo([statsRef.current, qrRef.current],
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" },
        "-=0.4"
      );
    }

    return () => tl.kill();
  }, [url]);

  if (error) {
    navigate("/dashboard");
  }

  let link = "";
  if (url) {
    link = url?.custom_url ? url?.custom_url : url.short_url;
  }

  const downloadImage = () => {
    try {
      const imageUrl = url?.qr;
      const fileName = url?.title;

      if (!imageUrl) {
        showAlert('downloadError');
        return;
      }

      const anchor = document.createElement('a');
      anchor.href = imageUrl;
      anchor.download = fileName || 'qr-code';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      showAlert('downloadSuccess');
    } catch (error) {
      showAlert('downloadError');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`https://zhourt.gt.tc/${link}`);
      showAlert('copySuccess');
    } catch (error) {
      showAlert('copyError');
    }
  };

  const handleDelete = () => {
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    setOpenDeleteDialog(false);
    fnDelete().then(() => {
      showAlert('deleteSuccess');
      setTimeout(() => navigate('/dashboard'), 1500);
    }).catch(() => {
      showAlert('deleteError');
    });
  };

  const isLoading = loading || loadingStats;

  return (
    <div className="relative min-h-screen">
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.3}
          amplitude={0.8}
          speed={0.3}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading Bar */}
        {isLoading && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <BarLoader width="100%" color="#ffffff" />
          </div>
        )}

        {/* Header */}
        <header ref={headerRef} className="mb-12">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="flex-1">

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="bg-transparent border-none text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-mono text-white my-4">
                <span className="bg-black relative inline-block px-4 py-2 rounded">
                  {url?.title || 'Link Details'}
                </span>
              </h1>

              <p className="text-sm text-white/80 max-w-2xl">
                Detailed analytics and management for your shortened URL
              </p>
            </div>

            {/* Breadcrumb */}
            <div className="flex-shrink-0">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="text-white/80 hover:text-white transition-colors">
                      Home
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-white/60" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard" className="text-white/80 hover:text-white transition-colors">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-white/60" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white font-medium">
                      Link Details
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Link Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Link Card */}
            <Card ref={mainCardRef} className="border-none bg-trasparent backdrop-blur-2xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-white mb-3">
                      {url?.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs font-mono text-white/70">
                      <Calendar className="w-4 h-4" />
                      Created {new Date(url?.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Short URL */}
                <div className="space-y-3">
                  <label className="text-sm font-mono text-white/90">
                    Short URL
                  </label>
                  <div className="flex items-center gap-3 p-4 mt-2 bg-white/5 border-none rounded-sm backdrop-blur-sm">
                    <a
                      href={`https://zhourt.gt.tc/${link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      https://zhourt.gt.tc/{link}
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/20"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Original URL */}
                <div className="space-y-3">
                  <label className="text-sm font-mono text-white/90">
                    Original URL
                  </label>
                  <div className="flex items-center gap-3 p-4 mt-2 bg-white/5 border-none rounded-sm backdrop-blur-sm">
                    <LinkIcon className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <a
                      href={url?.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-white/80 hover:text-white truncate transition-colors"
                    >
                      {url?.original_url}
                    </a>
                    <a href={url?.original_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 text-white/60 flex-shrink-0" /></a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 p-4 bg-transparent border-none text-white hover:bg-transparent hover:text-gray-400"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadImage}
                    className="flex items-center gap-2 p-4 bg-transparent border-none text-white hover:bg-transparent hover:text-blue-400"
                  >
                    <Download className="w-4 h-4" />
                    Download QR
                  </Button>
                  {/* Button Delete */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={loadingDelete}
                    className="flex items-center gap-2 bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:text-red-300"
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
            <Card ref={statsRef} className="border-none bg-transparent backdrop-blur-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-white">
                  <BarChart3 className="w-5 h-5" />
                  Analytics Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats && stats?.length ? (
                  <div className="space-y-8">
                    {/* Total Clicks */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-transparent border border-white/20 rounded-xl backdrop-blur-sm">
                        <div className="text-4xl font-mono font-normal text-white mb-2">
                          {stats?.length}
                        </div>
                        <div className="text-sm text-white/70 font-mono">
                          Total Clicks
                        </div>
                      </div>
                      <div className="p-4 bg-transparent border border-white/20 rounded-xl backdrop-blur-sm">
                        <div className="text-4xl font-mono font-normal text-white mb-2">
                          {new Set(stats?.map(stat => stat.ip)).size}
                        </div>
                        <div className="text-sm text-white/70 font-mono">
                          Unique Visitors
                        </div>
                      </div>
                      <div className="p-4 bg-transparent border border-white/20 rounded-xl backdrop-blur-sm">
                        <div className="text-4xl font-mono font-normal text-white mb-2">
                          {Math.round((stats?.length / Math.max(1, Math.ceil((new Date() - new Date(url?.created_at)) / (1000 * 60 * 60 * 24)))) * 100) / 100}
                        </div>
                        <div className="text-sm text-white/70 font-mono">
                          Avg Daily Clicks
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-8 justify-between">
                      {/* Location Data */}
                      <div className="space-y-4 w-full">
                        <h4 className="flex items-center gap-2 text-lg font-medium text-white">
                          <MapPin className="w-5 h-5" />
                          Location Analytics
                        </h4>
                        <div className="bg-transparent border border-white/20 rounded-xl p-6">
                          <Location stats={stats} />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="relative mb-6">
                      <BarChart3 className="w-16 h-16 text-white/40 mx-auto" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-3">
                      {loadingStats ? "Loading analytics..." : "No clicks yet"}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      Share your link to start collecting analytical data and insights
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* QR Code */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <Card ref={qrRef} className="border border-none bg-transparent backdrop-blur-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">
                  QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-19">
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <img
                      src={url?.qr}
                      alt="QR Code"
                      className="w-48 h-48 object-contain bg-white rounded-xl p-4 border border-white/20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-xl blur-xl -z-10" />
                  </div>

                  <p className="text-xs text-white/70 mb-6 font-mono text-center leading-relaxed">
                    Scan this QR code to instantly visit your shortened URL from any mobile device
                  </p>

                  <Button
                    onClick={downloadImage}
                    className="w-full bg-white/10 border border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-none bg-transparent backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
                  <Smartphone className="w-5 h-5" />
                  Device Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-19">
                <div className="">
                  <div className="bg-transparent rounded-xl p-2">
                    <DeviceStat stats={stats} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogContent className="max-w-md border-none bg-black/40 backdrop-blur-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <Trash className="w-5 h-5" />
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <div className="text-sm max-w-xs text-white mb-12">
              This action cannot be undone. Are you sure you want to delete this link?
            </div>
            <DialogFooter className="flex gap-3 justify-end border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setOpenDeleteDialog(false)}
                className="border-gray-300 text-white"
              >
                No
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={loadingDelete}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {loadingDelete ? <BeatLoader color="#fff" size={10} /> : "Yes, Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alert Container */}
        <AlertContainer
          alerts={alerts}
          onRemoveAlert={removeAlert}
          position="top-right"
        />
      </div>
    </div>
  );
};

export default Link;