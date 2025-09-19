import { storeClicks } from "@/db/apiClicks";
import { getLongUrl } from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { PropagateLoader } from "react-spinners";

const RedirectLink = () => {
  const { id } = useParams();

  const { loading, data, fn } = useFetch(getLongUrl, id);

  const { loading: loadingStats, fn: fnStats } = useFetch(storeClicks, {
    id: data?.id,
    originalUrl: data?.original_url
  });

  useEffect(() => {
    fn();
  }, [])

  useEffect(() => {
    if (!loading && data) {
      fnStats();
    }
  }, [loading])

  if (loading || loadingStats) {
    return (
      <>
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl">
          <PropagateLoader width="100%" color="#fff" />
        </div>>
        <br />
        Redirecting...
      </>
    )
  }

  return null
}

export default RedirectLink
