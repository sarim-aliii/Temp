import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Loader } from '../ui/Loader'; 


const ProtectedRoute = () => {
  const { currentUser, loading } = useAppContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <Loader spinnerClassName="w-8 h-8 text-blue-500" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;