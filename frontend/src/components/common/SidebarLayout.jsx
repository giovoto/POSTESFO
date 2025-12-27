import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/Sidebar";
import {
    IconLayoutDashboard,
    IconList,
    IconMap,
    IconPlus,
    IconLogout,
    IconUserBolt,
} from "@tabler/icons-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";
import './SidebarLayout.css'; // Optional: for specific overrides content container

export function SidebarLayout({ children }) {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const links = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: (
                <IconLayoutDashboard className="text-gray-700 dark:text-gray-200 h-6 w-6 flex-shrink-0" />
            ),
        },
        {
            label: "Lista de Postes",
            href: "/postes",
            icon: (
                <IconList className="text-gray-700 dark:text-gray-200 h-6 w-6 flex-shrink-0" />
            ),
        },
        {
            label: "Nuevo Poste",
            href: "/postes/nuevo",
            icon: (
                <IconPlus className="text-gray-700 dark:text-gray-200 h-6 w-6 flex-shrink-0" />
            ),
        },
        {
            label: "Mapa General",
            href: "/mapa",
            icon: (
                <IconMap className="text-gray-700 dark:text-gray-200 h-6 w-6 flex-shrink-0" />
            ),
        },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div
            className={cn(
                "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full h-screen overflow-hidden"
            )}
        >
            <Sidebar open={open} setOpen={setOpen} animate={true}>
                <SidebarBody className="justify-between gap-10 py-6 px-4">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {/* Logo / Brand */}
                        <div className="flex items-center gap-3 mb-10">
                            <div className="h-8 w-8 bg-green-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                                <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="font-bold text-xl text-gray-800 dark:text-white whitespace-pre">
                                Fiber System
                            </span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>

                    {/* Footer / User / Logout */}
                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 px-2 py-2">
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[150px]">
                                    {user?.username || 'Usuario'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {user?.rol || 'Rol'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-start gap-2 group/sidebar py-2 px-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-md transition-colors w-full text-red-600 dark:text-red-400"
                        >
                            <IconLogout className="h-5 w-5 flex-shrink-0" />
                            <span className="text-sm font-medium whitespace-pre inline-block">
                                Cerrar Sesión
                            </span>
                        </button>
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 h-full overflow-hidden bg-white dark:bg-neutral-900 md:rounded-tl-3xl shadow-2xl relative z-10">
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
