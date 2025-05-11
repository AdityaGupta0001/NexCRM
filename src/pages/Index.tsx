
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // If auth check is complete
    if (!loading) {
      if (isAuthenticated) {
        navigate("/dashboard", { replace: true });
      } else {
        // If not authenticated, go to landing page
        navigate("/", { replace: true });
      }
    }
  }, [navigate, isAuthenticated, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        <p className="text-xl text-gray-600">Setting up your NexCRM dashboard</p>
        <div className="mt-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
