import {useEffect, useState} from "react";
import {BarLoader} from "react-spinners";
import {Filter, Link2, TrendingUp, Plus, Search} from "lucide-react";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

import LinkCard from "@/components/link-card";
import Error from "@/components/error";

import useFetch from "@/hooks/use-fetch";

import {getUrls} from "@/db/apiUrls";
import {getClicksForUrls} from "@/db/apiClicks";
import {UrlState} from "@/context";
import { CreateLink } from "@/components/create-link";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {user} = UrlState();
  const {loading, error, data: urls, fn: fnUrls} = useFetch(getUrls, user.id);
  const {
    loading: loadingClicks,
    data: clicks,
    fn: fnClicks,
  } = useFetch(
    getClicksForUrls,
    urls?.map((url) => url.id)
  );

  useEffect(() => {
    fnUrls();
  }, []);

  const filteredUrls = urls?.filter((url) =>
    url.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (urls?.length) fnClicks();
  }, [urls?.length]);

  // Calculate stats
  const totalClicks = clicks?.length || 0;
  const totalLinks = urls?.length || 0;
  const avgClicksPerLink = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;

  const stats = [
    {
      title: "Total Links",
      value: totalLinks,
      icon: Link2,
      description: "Active shortened URLs"
    },
    {
      title: "Total Clicks",
      value: totalClicks,
      icon: TrendingUp,
      description: "Across all your links"
    },
    {
      title: "Avg Clicks/Link",
      value: avgClicksPerLink,
      icon: TrendingUp,
      description: "Performance metric"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Loading Bar */}
      {(loading || loadingClicks) && (
        <div className="mb-6">
          <BarLoader width={"100%"} color="rgb(107 114 128)" />
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-mono text-white mb-2">
          Dashboard
        </h1>
        <p className="text-white">
          Manage and track your shortened URLs
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          My Links
        </h2>
        <CreateLink />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search links..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <Error message={error?.message} />
        </div>
      )}

      {/* Links List */}
      <div className="space-y-4">
        {filteredUrls && filteredUrls.length > 0 ? (
          filteredUrls.map((url, i) => (
            <LinkCard key={i} url={url} fetchUrls={fnUrls} />
          ))
        ) : (
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Link2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No links found' : 'No links yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create your first shortened URL to get started'
                }
              </p>
              {!searchQuery && <CreateLink />}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;