import React, { useState, useEffect, useRef } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp } from '../utils/animations';

const Header = ({
    title,
    user,
    logout,
    currentTime,
    currentDate,
    userInitial
}) => {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const [profileMenuPosition, setProfileMenuPosition] = useState({ top: 0, right: 0 });

    // Click outside for profile menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update profile menu position when opened
    useEffect(() => {
        if (profileMenuOpen && profileMenuRef.current) {
            const rect = profileMenuRef.current.getBoundingClientRect();
            setProfileMenuPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
        }
    }, [profileMenuOpen]);

    // Handle window resize for profile menu
    useEffect(() => {
        const handleResize = () => {
            if (profileMenuOpen && profileMenuRef.current) {
                const rect = profileMenuRef.current.getBoundingClientRect();
                setProfileMenuPosition({
                    top: rect.bottom + 8,
                    right: window.innerWidth - rect.right
                });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [profileMenuOpen]);

    return (
        <motion.header
            className="app-header bg-white/40 backdrop-blur-md border-b border-[var(--border-main)] sticky top-0 z-[1000]"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
        >
            <div className="px-6 py-4 flex items-center justify-between relative z-10 w-full">
                {/* Left side - Empty for centering */}
                <div className="w-48"></div>

                {/* Center - Title */}
                <div className="flex-1 flex justify-center items-center">
                    <h1 className="header-title text-[var(--text-main)] tracking-tight uppercase font-black text-2xl">
                        {title}
                    </h1>
                </div>

                {/* Right side - Date/Time and Profile */}
                <div className="flex items-center space-x-6 min-w-[300px] justify-end">
                    {/* Date and Time */}
                    <div className="bg-[var(--bg-app)] px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-[var(--border-main)] shadow-sm">
                        <span className="tabular-nums font-black text-[var(--text-main)] text-xs">{currentTime}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-main)]"></div>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">{currentDate}</span>
                    </div>

                    {/* Profile Menu */}
                    <div className="relative" ref={profileMenuRef}>
                        <button
                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                            className="w-11 h-11 flex items-center justify-center font-black text-[var(--text-main)] bg-white border border-[var(--border-main)] rounded-xl hover:scale-110 transition-transform shadow-sm"
                        >
                            {userInitial}
                        </button>

                        {profileMenuOpen && (
                            <div
                                className="fixed z-[9999] w-72 premium-card py-2 p-1"
                                style={{
                                    position: 'fixed',
                                    top: `${profileMenuPosition.top}px`,
                                    right: `${profileMenuPosition.right}px`
                                }}
                            >
                                <div className="px-5 py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-black w-14 h-14 rounded-full flex items-center justify-center text-slate-900 font-bold text-xl shadow-md flex-shrink-0">
                                            {userInitial}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-black text-lg truncate">{user?.full_name || 'User'}</p>
                                            <p className="text-sm text-gray-500 mt-1 truncate">{user?.email || 'user@example.com'}</p>
                                            <span className="inline-block mt-2 px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700 capitalize">
                                                {user?.role || 'User'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2 border-t border-gray-100">
                                    <button className="w-full px-5 py-3 text-left text-sm text-black hover:bg-gray-50 flex items-center space-x-3">
                                        <User className="h-5 w-5 text-gray-500" />
                                        <span className="font-medium">Profile Settings</span>
                                    </button>
                                    <button className="w-full px-5 py-3 text-left text-sm text-black hover:bg-gray-50 flex items-center space-x-3">
                                        <Settings className="h-5 w-5 text-gray-500" />
                                        <span className="font-medium">Account Settings</span>
                                    </button>
                                </div>

                                <div className="border-t border-gray-100 py-2">
                                    <button
                                        onClick={() => {
                                            logout();
                                            setProfileMenuOpen(false);
                                        }}
                                        className="w-full px-5 py-3 text-left text-sm text-black hover:bg-gray-50 flex items-center space-x-3"
                                    >
                                        <LogOut className="h-5 w-5 text-gray-500" />
                                        <span className="font-semibold">Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
