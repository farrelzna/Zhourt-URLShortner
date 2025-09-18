import { useEffect, useState, useRef, useMemo } from "react";
import { BarLoader } from "react-spinners";
import { Link2, TrendingUp, Search, BarChart3, Star, Smartphone, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import LinkCard from "@/components/link-card";
import Error from "@/components/error";
import Aurora from '@/components/Aurora';
import { AlertContainer } from '@/components/AlertNotification';

import useFetch from "@/hooks/use-fetch";

import { getUrls } from "@/db/apiUrls";
import { getClicksForUrls } from "@/db/apiClicks";
import { UrlState } from "@/context";
import { CreateLink } from "@/components/create-link";

import { gsap } from 'gsap';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Configurable items per page
  const [alerts, setAlerts] = useState([]);

  const { user } = UrlState();
  const { loading, error, data: urls, fn: fnUrls } = useFetch(getUrls, user?.id);
  const {
    loading: loadingClicks,
    data: clicks,
    fn: fnClicks,
  } = useFetch(
    getClicksForUrls,
    urls?.map((url) => url.id)
  );

  const statsRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fnUrls();
    }
  }, [user?.id]);

  // Filter URLs based on search query
  const filteredUrls = useMemo(() => {
    if (!urls) return [];
    return urls.filter((url) =>
      url?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url?.short_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url?.original_url?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [urls, searchQuery]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate pagination
  const totalItems = filteredUrls.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUrls = filteredUrls.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  useEffect(() => {
    if (urls?.length) fnClicks();
  }, [urls?.length]);

  // Animate components on load
  useEffect(() => {
    const tl = gsap.timeline();

    if (headerRef.current) {
      tl.fromTo(headerRef.current.children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" }
      );
    }

    if (statsRef.current) {
      tl.fromTo(statsRef.current.children,
        { y: 30, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)" },
        "-=0.3"
      );
    }

    if (contentRef.current) {
      tl.fromTo(contentRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.2"
      );
    }

    return () => tl.kill();
  }, []);

  // Calculate stats with error handling
  const totalClicks = clicks?.length || 0;
  const totalLinks = urls?.length || 0;
  const avgClicksPerLink = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;

  const stats = [
    {
      title: "Total Links",
      value: totalLinks,
      icon: Link2,
      description: "Active shortened URLs",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Total Clicks",
      value: totalClicks,
      icon: TrendingUp,
      description: "Across all your links",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Avg Clicks/Link",
      value: avgClicksPerLink,
      icon: BarChart3,
      description: "Performance metric",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const isLoading = loading || loadingClicks;

  // Helper: Get top links in last 7 days
  const getTopLinksThisWeek = () => {
    if (!urls || !clicks) return [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Filter clicks in last 7 days
    const recentClicks = clicks.filter(
      (c) => new Date(c.created_at) >= sevenDaysAgo
    );

    // Count clicks per url
    const clickCountMap = {};
    recentClicks.forEach((c) => {
      clickCountMap[c.url_id] = (clickCountMap[c.url_id] || 0) + 1;
    });

    // Map urls with their click count
    const urlWithClicks = urls.map((url) => ({
      ...url,
      clicks: clickCountMap[url.id] || 0,
    }));

    // Sort by clicks desc, ambil top 5
    return urlWithClicks
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);
  };

  const topLinks = getTopLinksThisWeek();

  const removeAlert = (id) => setAlerts((prev) => prev.filter(a => a.id !== id));

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
        {/* Loading Bar - Fixed positioning */}
        {isLoading && (
          <div className="fixed top-0 left-0 right-0 z-50 mb-6">
            <BarLoader width="100%" color="#ffffff" />
          </div>
        )}

        {/* Header Section */}
        <header className="">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div ref={headerRef} className="flex-1">
              <Badge variant="secondary" className="mb-4 bg-white/20 backdrop-blur-xl text-gray-300 border-0">
                Welcome back, {user?.user_metadata?.name || user?.email || 'User'}
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-mono text-white mb-4">
                Dashboard
              </h1>

              <p className="text-sm text-white/80 max-w-2xl">
                Manage and track your shortened URLs with powerful analytics and insights
              </p>
            </div>

            {/* Breadcrumb - Better responsive positioning */}
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
                    <BreadcrumbPage className="text-white font-medium">
                      Dashboard
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="my-16">
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <Card
                key={stat.title}
                className="border-none bg-transparent backdrop-blur-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden group"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-mono font-medium text-white/90">
                    {stat.title}
                  </CardTitle>
                  <div className="relative">
                    <stat.icon className="h-5 w-5 text-white/70 transition-all duration-700 group-hover:scale-125 group-hover:text-white" />
                    {/* Icon glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-700 blur-lg`} />
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 pt-0">
                  <div className="text-3xl font-bold font-mono text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-200 transition-all duration-700">
                    {stat.value.toLocaleString()}
                  </div>
                  <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-700">
                    {stat.description}
                  </p>
                </CardContent>

                {/* Floating particles effect */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-ping" />
                <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-900 animate-pulse" />
              </Card>
            ))}
          </div>
        </section>

        {/* Main Content Section */}
        <section ref={contentRef}>
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-mono text-white mb-2">
              Your Links
            </h2>
            <p className="text-white/70 text-sm">
              {totalLinks === 0 ? 'Start by creating your first link' : `Manage your ${totalLinks} shortened URLs`}
            </p>
          </div>

          <div className="flex gap-8">
            <Card className="border-none bg-transparent backdrop-blur-2xl w-7xl">
              <CardContent className="p-6 lg:p-8">
                {/* Search and Actions Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                    <Input
                      type="text"
                      placeholder="Search your links..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 bg-white/5 border border-white/30 text-white placeholder:text-white/50 focus:bg-white/10 focus:border-white/50 backdrop-blur-sm rounded-xl transition-all duration-300"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <CreateLink />
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-6">
                    <Error message={error?.message || 'An error occurred while loading your links'} />
                  </div>
                )}

                {/* Links List with Pagination */}
                <div className="space-y-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <div className="text-white/60">Loading your links...</div>
                    </div>
                  ) : currentUrls && currentUrls.length > 0 ? (
                    <>
                      {/* Links Grid */}
                      <div className="space-y-4">
                        {currentUrls.map((url, i) => (
                          <div
                            key={url.id || i}
                            className="transform transition-all duration-300 hover:scale-[1.01]"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            <LinkCard url={url} fetchUrls={fnUrls} />
                          </div>
                        ))}
                      </div>

                      {/* Results Summary */}
                      <div className="flex justify-between items-center text-sm text-white/70 mb-6">
                        <div>
                          {searchQuery ? (
                            `Found ${totalItems} link${totalItems !== 1 ? 's' : ''} matching "${searchQuery}"`
                          ) : (
                            `Showing ${startIndex + 1}-${Math.min(endIndex, totalItems)} of ${totalItems} link${totalItems !== 1 ? 's' : ''}`
                          )}
                        </div>
                        <div>
                          Page {currentPage} of {totalPages}
                        </div>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex justify-center pt-8">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                  className={`cursor-pointer bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                // aria-disabled={currentPage === 1}
                                />
                              </PaginationItem>

                              {getPageNumbers().map((pageNum, index) => (
                                <PaginationItem key={index}>
                                  {pageNum === 'ellipsis' ? (
                                    <PaginationEllipsis className="text-white/60" />
                                  ) : (
                                    <PaginationLink
                                      onClick={() => setCurrentPage(pageNum)}
                                      isActive={currentPage === pageNum}
                                      className={`cursor-pointer border-white/20 transition-all duration-300 ${currentPage === pageNum
                                        ? 'bg-white/20 text-white border-white/40'
                                        : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white hover:border-white/40'
                                        }`}
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  )}
                                </PaginationItem>
                              ))}

                              <PaginationItem>
                                <PaginationNext
                                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                  className={`cursor-pointer bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                // aria-disabled={currentPage === totalPages}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </>
                  ) : (
                    <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
                      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="relative mb-8">
                          <Link2 className="h-20 w-20 text-white/30" />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse" />
                        </div>

                        <h3 className="text-2xl font-semibold text-white mb-4">
                          {searchQuery ? 'No links found' : 'No links yet'}
                        </h3>

                        <p className="text-white/70 mb-8 max-w-md leading-relaxed">
                          {searchQuery
                            ? `No links match "${searchQuery}". Try adjusting your search terms or create a new link.`
                            : 'Create your first shortened URL and start tracking your analytics. It only takes a few seconds!'
                          }
                        </p>

                        {!searchQuery && (
                          <div className="animate-bounce">
                            <CreateLink />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-none bg-transparent backdrop-blur-2xl w-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Top Links This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {topLinks.length === 0 ? (
                  <div className="text-center text-white/60 py-8">
                    No link activity this week.
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {topLinks.map((url, idx) => (
                      <li key={url.id} className="flex items-center justify-between bg-white/5 border border-white/20 rounded-xl px-4 py-3">
                        <div className="flex flex-col">
                          <a
                            href={url.short_url || `https://zhourt.gt.tc/${url.short_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                          >
                            {url.title || url.short_url}
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </a>
                          <span className="text-xs text-white/70 truncate max-w-xs">{url.original_url}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-2 py-1">
                            {url.clicks} clicks
                          </Badge>
                          <span className="text-xs text-white/50">#{idx + 1}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <AlertContainer
          alerts={alerts}
          onRemoveAlert={removeAlert}
          position="top-right"
        />
      </div>
    </div>
  );
};

export default Dashboard;