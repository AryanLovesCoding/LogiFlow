import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

function AppShell() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <TopNav />
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppShell;