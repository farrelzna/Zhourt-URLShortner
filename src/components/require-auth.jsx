import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {UrlState} from "@/context";
import {PropagateLoader} from "react-spinners";

function RequireAuth({children}) {
  const navigate = useNavigate();

  const {loading, isAuthenticated} = UrlState();

  useEffect(() => {
    if (!isAuthenticated && loading === false) {
      navigate("/auth");
    }
  }, [isAuthenticated, loading, navigate]);

  // if (loading) return <PropagateLoader width={"100%"} color="rgb(107 114 128)" />;

  if (isAuthenticated) return children;

  // Return null when not authenticated and not loading (during navigation)
  return null;
}

export default RequireAuth;