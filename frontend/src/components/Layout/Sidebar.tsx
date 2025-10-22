// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { LayoutDashboardIcon, MonitorIcon, AlertCircleIcon, UsersIcon, FileTextIcon } from 'lucide-react';

// const getLinkClassName = (isActive: boolean): string => 
//   `flex items-center py-2 px-4 rounded transition-colors ${isActive ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-blue-700 hover:text-white'}`;

// interface SidebarProps {
//   userRole: 'Admin' | 'Technicien' | 'User';
// }

// const Sidebar: React.FC<SidebarProps> = ({ userRole }) => (
//   <div className="bg-blue-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
//     <div className="flex items-center space-x-2 px-4">
//       <span className="text-2xl font-semibold">GPIT</span>
//     </div>
//     <nav className="mt-10">
//       <NavLink to="/dashboard" className={({ isActive }) => getLinkClassName(isActive)}>
//         <LayoutDashboardIcon className="mr-3 h-5 w-5" />
//         <span>Tableau de bord</span>
//       </NavLink>
//       <NavLink to="/equipment" className={({ isActive }) => getLinkClassName(isActive)}>
//         <MonitorIcon className="mr-3 h-5 w-5" />
//         <span>Équipements</span>
//       </NavLink>
//       <NavLink to="/incidents" className={({ isActive }) => getLinkClassName(isActive)}>
//         <AlertCircleIcon className="mr-3 h-5 w-5" />
//         <span>Incidents</span>
//       </NavLink>
//       {userRole === 'Admin' && (
//         <NavLink to="/users" className={({ isActive }) => getLinkClassName(isActive)}>
//           <UsersIcon className="mr-3 h-5 w-5" />
//           <span>Utilisateurs</span>
//         </NavLink>
//       )}
//       {(userRole === 'Admin' || userRole === 'Technicien') && (
//         <NavLink to="/reports" className={({ isActive }) => getLinkClassName(isActive)}>
//           <FileTextIcon className="mr-3 h-5 w-5" />
//           <span>Rapports</span>
//         </NavLink>
//       )}
//     </nav>
//   </div>
// );

// export default Sidebar;
