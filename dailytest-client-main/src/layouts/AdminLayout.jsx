// // frontend/src/layouts/AdminLayout.jsx
// import React, { useState } from 'react';
// import { Outlet, NavLink, useNavigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth.jsx';
// import {
//   Home,
//   Users,
//   HelpCircle,
//   History,
//   Trophy,
//   LogOut,
//   ClipboardList,
// } from 'lucide-react';

// function AdminLayout() {
//   const { logout } = useAuth();
//   const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const handleLogout = () => {
//     logout();
//     navigate('/admin/login');
//   };

//   const linkStyle = "flex items-center space-x-3 px-3 py-2 rounded-lg transition group";
//   const activeLinkStyle = "bg-white/30 text-white";
//   const inactiveLinkStyle = "bg-white/5 hover:bg-white/20 text-gray-200";

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Animated gradient CSS */}
//       <style>
//         {`
//           @keyframes gradientBG {
//             0% {
//               background-position: 0% 50%;
//             }
//             50% {
//               background-position: 100% 50%;
//             }
//             100% {
//               background-position: 0% 50%;
//             }
//           }
//           .animate-gradient-move {
//             background: linear-gradient(120deg, #34d399 0%, #10b981 50%, #059669 100%);
//             background-size: 200% 200%;
//             animation: gradientBG 8s ease infinite;
//           }
//         `}
//       </style>

//       {/* Mobile Overlay */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 md:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         ></div>
//       )}

//       {/* Sidebar Toggle Button (Mobile Only) */}
//       <button
//         className="md:hidden fixed top-4 left-4 z-50 p-2 text-gray-800 bg-white rounded-md shadow-md"
//         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//       >
//         <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//         </svg>
//       </button>

//       {/* Sidebar */}
//       <aside
//         className={`transform ${
//           isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
//         }
//           md:translate-x-0 transition-transform duration-300 ease-in-out
//           w-64 text-white p-6 flex flex-col fixed inset-y-0 left-0 z-50
//           md:fixed md:inset-y-0 md:left-0 md:shadow-none
//           animate-gradient-move
//           backdrop-blur-xl bg-opacity-90
//         `}
//       >
//         {/* Logo */}
//         <div className="mb-8 flex justify-center">
//            <img
//             src="data:image/jpeg;base64,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"
//              alt="Logo"
//              className="w-16 h-16 rounded-full shadow-lg border-4 border-white/20 bg-white/40"
//           />
//         </div>
//         <nav className="flex-grow">
//           <ul className="space-y-4">
//             <li>
//               <NavLink
//                 to="/admin"
//                 end
//                 className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
//                 onClick={() => setIsSidebarOpen(false)}
//               >
//                 <Home className="h-5 w-5 group-hover:text-white transition" />
//                 <span className="font-medium group-hover:text-white">Dashboard</span>
//               </NavLink>
//             </li>
            
//             <li>
//               <NavLink
//                 to="/admin/workers"
//                 className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
//                 onClick={() => setIsSidebarOpen(false)}
//               >
//                 <Users className="h-5 w-5 group-hover:text-white transition" />
//                 <span className="font-medium group-hover:text-white">Manage employees</span>
//               </NavLink>
//             </li>
//             <li>
//               <NavLink
//                 to="/admin/questions"
//                 className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
//                 onClick={() => setIsSidebarOpen(false)}
//               >
//                 <HelpCircle className="h-5 w-5 group-hover:text-white transition" />
//                 <span className="font-medium group-hover:text-white">Generate Questions</span>
//               </NavLink>
//             </li>
//             <li>
//               <NavLink
//                 to="/admin/question-history"
//                 className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
//                 onClick={() => setIsSidebarOpen(false)}
//               >
//                 <History className="h-5 w-5 group-hover:text-white transition" />
//                 <span className="font-medium group-hover:text-white">Question History</span>
//               </NavLink>
//             </li>
//             <li>
//               <NavLink
//                 to="/scoreboard"
//                 className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
//                 onClick={() => setIsSidebarOpen(false)}
//               >
//                 <Trophy className="h-5 w-5 group-hover:text-white transition" />
//                 <span className="font-medium group-hover:text-white">Scoreboard</span>
//               </NavLink>
//             </li>
//             <li>
//               <NavLink
//                 to="/admin/employee-scoreboard"
//                 className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`}
//                 onClick={() => setIsSidebarOpen(false)}
//               >
//                 <ClipboardList className="h-5 w-5 group-hover:text-white transition" />
//                 <span className="font-medium group-hover:text-white">Employee Scoreboard</span>
//               </NavLink>
//             </li>
//           </ul>
//         </nav>
//         <button
//           onClick={handleLogout}
//           className="mt-8 bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-200 flex items-center justify-center space-x-2"
//         >
//           <LogOut className="h-5 w-5"  />
//           <span>Logout</span>
//         </button>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-4 sm:p-8 overflow-auto bg-gradient-to-br from-green-50 to-emerald-100 text-gray-800 md:ml-64">

//         <Outlet /> {/* Renders nested routes */}
//       </main>
//     </div>
//   );
// }

// export default AdminLayout;
import React, { useState, Fragment, useCallback, useMemo, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  Home,
  Users,
  HelpCircle,
  History,
  Trophy,
  LogOut,
  ClipboardList,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import techLogo from '../assets/images/tech logo.jpeg';

// Stable Tooltip component
const Tooltip = React.memo(({ children, text }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute left-full ml-4 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 scale-95 group-hover:scale-100">
      {text}
      <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-emerald-600"></div>
    </div>
  </div>
));

// Completely optimized NavItem with no reload issues
const NavItem = React.memo(({ to, icon: Icon, text, isSidebarOpen, onClick }) => {
  const location = useLocation();
  
  const isActive = useMemo(() => {
    if (to === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.startsWith(to);
  }, [location.pathname, to]);

  // Prevent default and handle navigation manually
  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only navigate if not already on the same route
    if (!isActive) {
      onClick(to);
    }
  }, [isActive, onClick, to]);

  const linkContent = useMemo(() => (
    <Fragment>
      <div className={`relative flex items-center justify-center transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
        <Icon className={`flex-shrink-0 w-6 h-6 transition-all duration-300 ${
          isActive ? 'text-white' : 'text-emerald-700 group-hover:scale-110'
        }`} />
        {isActive && (
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
        )}
      </div>
      {isSidebarOpen && (
        <span className="whitespace-nowrap font-semibold tracking-wide transition-all duration-300">
          {text}
        </span>
      )}
    </Fragment>
  ), [Icon, isActive, isSidebarOpen, text]);

  return (
    <div 
      onClick={handleClick}
      className={`group cursor-pointer flex items-center space-x-4 p-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
        isActive
          ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]"
          : "text-emerald-800 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-green-100 hover:shadow-md"
      }`}
    >
      {/* Animated background effect */}
      {isActive && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            animation: 'shimmer 3s linear infinite'
          }}
        />
      )}
      
      {isSidebarOpen ? (
        <div className="relative z-10 flex items-center space-x-4">
          {linkContent}
        </div>
      ) : (
        <Tooltip text={text}>
          <div className="relative z-10">
            {linkContent}
          </div>
        </Tooltip>
      )}
      
      {/* Active indicator dot */}
      {isActive && isSidebarOpen && (
        <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse" />
      )}
    </div>
  );
});

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('/admin');
  const navigationRef = useRef(false);

  // Handle navigation without reload
  const handleNavigation = useCallback((to) => {
    if (navigationRef.current) return;
    navigationRef.current = true;
    
    setCurrentRoute(to);
    navigate(to, { replace: false });
    
    // Reset navigation lock after a short delay
    setTimeout(() => {
      navigationRef.current = false;
    }, 100);
  }, [navigate]);

  // Memoized handlers
  const handleLogout = useCallback(() => {
    logout();
    navigate('/admin/login');
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Stable navigation items
  const navigationItems = useMemo(() => [
    { to: "/admin", icon: Home, text: "Dashboard" },
    { to: "/admin/workers", icon: Users, text: "Manage Employees" },
    { to: "/admin/questions", icon: HelpCircle, text: "Generate Questions" },
    { to: "/admin/question-history", icon: History, text: "Question History" },
    { to: "/admin/employee-scoreboard", icon: ClipboardList, text: "Employee Scores" },
    { to: "/scoreboard", icon: Trophy, text: "Global Scoreboard" }
  ], []);

  // Stable user avatar URL
  const userAvatarUrl = useMemo(() => 
    `https://ui-avatars.com/api/?name=${user?.name || 'A'}&background=10b981&color=fff&rounded=true&bold=true`,
    [user?.name]
  );

  const SidebarContent = React.memo(() => (
    <div className="flex flex-col h-full bg-gradient-to-b from-green-50 via-emerald-50/95 to-teal-50/90 backdrop-blur-xl relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/40 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-0 w-40 h-40 bg-gradient-to-tr from-teal-200/40 to-transparent rounded-full blur-3xl animate-pulse" />
      
      {/* Header Section */}
      <div className={`relative flex items-center p-4 h-20 border-b border-emerald-200/50 bg-white/30 backdrop-blur-sm transition-all duration-300 ${
        isSidebarOpen ? 'justify-between' : 'justify-center'
      }`}>
        {isSidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-xl blur-md opacity-60 animate-pulse" />
              <img src={techLogo} alt="Logo" className="relative w-10 h-10 rounded-xl shadow-lg border-2 border-white/50" />
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
                Admin Panel
              </span>
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <Shield className="w-3 h-3" />
                <span>Secure Dashboard</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-xl blur-md opacity-60 animate-pulse" />
            <img src={techLogo} alt="Logo" className="relative w-10 h-10 rounded-xl shadow-lg border-2 border-white/50" />
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-emerald-600 bg-white/70 hover:bg-white shadow-md hover:shadow-lg transition-all hidden lg:block hover:scale-105"
        >
          {isSidebarOpen ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navigationItems.map((item) => (
          <NavItem 
            key={item.to}
            to={item.to} 
            icon={item.icon} 
            text={item.text} 
            isSidebarOpen={isSidebarOpen}
            onClick={handleNavigation}
          />
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-emerald-200/50 bg-white/30 backdrop-blur-sm">
        <div className={`flex items-center p-3 rounded-2xl mb-3 bg-gradient-to-r from-white/50 to-white/30 shadow-sm transition-all duration-300 hover:scale-[1.02] ${
          !isSidebarOpen && 'justify-center'
        }`}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-md opacity-60" />
            <img 
              src={userAvatarUrl}
              alt="User avatar" 
              className="relative w-11 h-11 rounded-full flex-shrink-0 border-2 border-white/50 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          
          {isSidebarOpen && (
            <div className="ml-3 overflow-hidden">
              <p className="font-bold text-sm bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {user?.role || 'Administrator'}
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all duration-300 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] ${
            !isSidebarOpen && 'justify-center'
          }`}
        >
          <LogOut className="flex-shrink-0 w-5 h-5" />
          {isSidebarOpen && (
            <span className="font-semibold whitespace-nowrap">Logout</span>
          )}
        </button>
      </div>
    </div>
  ));

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 font-sans">
      {/* Custom Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(16, 185, 129, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #14b8a6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #0d9488);
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-200px); }
          100% { transform: translateX(200px); }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col border-r-2 border-emerald-200/30 transition-all duration-300 ease-in-out shadow-xl ${
        isSidebarOpen ? 'w-80' : 'w-24'
      }`}>
        <SidebarContent />
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <aside className="fixed inset-y-0 left-0 w-80 z-50 lg:hidden shadow-2xl transform transition-transform duration-300">
          <div className="relative h-full">
            <SidebarContent />
            {/* Close button for mobile */}
            <button
              onClick={closeMobileMenu}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/80 text-emerald-600 shadow-lg lg:hidden hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-gradient-to-r from-white/80 via-emerald-50/80 to-green-50/80 backdrop-blur-md border-b-2 border-emerald-200/30 p-4 flex items-center justify-between shadow-md">
          <button 
            onClick={toggleMobileMenu}
            className="p-2.5 bg-white rounded-xl shadow-md text-emerald-600 hover:shadow-lg transition-all hover:scale-105"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-lg blur opacity-60" />
              <img src={techLogo} alt="Logo" className="relative w-9 h-9 rounded-lg shadow-md" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
              Admin
            </span>
          </div>
          
          <div className="w-10"></div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
          {/* Background decoration */}
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-teal-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10 transition-opacity duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;