import React, { useState, useRef, useEffect } from 'react';
import ProfileEditModal from './ProfileEditModal';
import ApiService from '../services/api';
import { useNavigate } from 'react-router-dom';

const UserDropdown = ({ user, setUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [fullUserProfile, setFullUserProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleFavorite = () => {
        navigate("/favorites");
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsOpen(false);
    };

    const handleEditProfile = async () => {
        setIsOpen(false);
        setLoading(true);
        
        try {
            // console.log('Fetching user profile...');
            const profileData = await ApiService.getUserProfile();
            // console.log('Profile data received:', profileData);
            setFullUserProfile(profileData);
            setIsProfileModalOpen(true);
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Show error to user
            alert('Failed to load profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (profileData) => {
        try {
            // console.log('Saving profile data:', profileData);
            const updatedProfile = await ApiService.updateUserProfile(profileData);
            // console.log('Profile updated:', updatedProfile);
            
            setFullUserProfile(updatedProfile);
            
            // Update the user state if name changed
            if (updatedProfile.custom_name || updatedProfile.name !== user.name) {
                setUser({
                    ...user,
                    name: updatedProfile.display_name || updatedProfile.custom_name || updatedProfile.name
                });
            }
            
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error; // Re-throw so the modal can handle it
        }
    };

    const displayName = user?.name || user?.username || user?.email || 'User';
    const displayPicture = user?.picture || user?.avatar;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* User Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
            >
                {displayPicture ? (
                    <img
                        src={displayPicture}
                        alt={displayName}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                )}
                
                {/* Fallback avatar (hidden by default) */}
                <div 
                    className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium" 
                    style={{ display: 'none' }}
                >
                    {displayName.charAt(0).toUpperCase()}
                </div>

                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">
                    {displayName}
                </span>

                <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>

                        {/* Menu Items */}
                        <button
                            onClick={handleEditProfile}
                            disabled={loading}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center disabled:opacity-50"
                        >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            {loading ? 'Loading...' : 'Edit Profile'}
                        </button>
                        {/* favorite button */}
                        <button
                            onClick={handleFavorite}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center rounded-md transition duration-200"
                            >
                            <svg
                                className="w-4 h-4 mr-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5.121 19.364l1.415-1.415A8 8 0 1116.97 7.93l1.415-1.415A10 10 0 105.12 19.364z"
                                />
                            </svg>
                            Favorites
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign out
                        </button>

                        
                    </div>
                </div>
            )}

            {/* Profile Edit Modal */}
            <ProfileEditModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={fullUserProfile}
                onSave={handleSaveProfile}
            />
        </div>
    );
};

export default UserDropdown;
