import './App.css';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import Ticker from './pages/Ticker/Ticker';
import Navbar from './components/Navbar/Navbar';

// Layout component includes Navbar and renders child routes via Outlet
function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />, // Wrap all routes in Layout
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/ticker",
        element: <Ticker />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
