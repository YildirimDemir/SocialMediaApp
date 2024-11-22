'use client';
import React, { useState, useCallback } from 'react';
import Style from './sidebar.module.css';
import Link from 'next/link';
import { FaHome, FaSearch, FaBell, FaEnvelope, FaUser, FaPlus, FaCaretDown, FaHeart, FaCog, FaSignOutAlt, FaChartLine, FaChartBar, FaCompass } from 'react-icons/fa';
import { useRouter } from 'next/navigation'; 
import { requestUser, userLogout, getFilteredUsers } from '@/services/apiUsers'; 
import { toast } from 'react-hot-toast'; 
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { IUser } from '@/models/userModel'; 
import Image from 'next/image';

export default function Sidebar() {
  const [isMoreLinksOpen, setMoreLinksOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false); 
  const [isNotificationsOpen, setNotificationsOpen] = useState(false); 
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const router = useRouter(); 

  const toggleMoreLinks = () => {
    setMoreLinksOpen(!isMoreLinksOpen);
  };

  const toggleSearchSidebar = () => {
    setSearchOpen(!isSearchOpen); 
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!isNotificationsOpen);
  }

  const handleLogout = async () => {
    try {
      await userLogout();
      toast.success('Logged out successfully!');
      router.push('/login'); 
    } catch (error) {
      toast.error('Error logging out!'); 
    }
  };

  const handleUserProfile = (userId: string) => {
    router.push(`/${userId}`); 
  };

  const fetchSearchResults = useCallback(
    debounce(async (query: string) => {
      if (!query) return setSearchResults([]);
      try {
        const results: IUser[] = await getFilteredUsers(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }, 300),
    []
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    fetchSearchResults(query);
  };

  return (
    <div className={`${Style.sidebar} ${isSearchOpen ? Style.narrow : ''} ${isNotificationsOpen ? Style.narrow : ''}`}>
      <Link href="/" legacyBehavior>
        <a className={Style.sidebarLink}>
          <span><FaHome /></span>
          <p>Home</p>
        </a>
      </Link>
      <button onClick={toggleSearchSidebar} className={Style.sidebarLink}>
        <span><FaSearch /></span>
        <p>Search</p>
      </button>
      <Link href="/explore" legacyBehavior>
        <a className={Style.sidebarLink}>
          <span><FaCompass /></span>
          <p>Explore</p>
        </a>
      </Link>
        {/* <button onClick={toggleNotifications} className={Style.sidebarLink}>
          <span><FaBell /></span>
          <p>Notifications</p>
        </button> */}
      <Link href="/chats" legacyBehavior>
        <a className={Style.sidebarLink}>
          <span><FaEnvelope /></span>
          <p>Chats</p>
        </a>
      </Link>
      <Link href="/create-post" legacyBehavior>
        <a className={Style.sidebarLink}>
          <span><FaPlus /></span>
          <p>Create</p>
        </a>
      </Link>
      <Link href="/profile" legacyBehavior>
        <a className={Style.sidebarLink}>
          <span><FaUser /></span>
          <p>Profile</p>
        </a>
      </Link>
      
      {isMoreLinksOpen && (
        <div className={Style.moreLinks}>
          <Link href="/your-activity" legacyBehavior>
            <a className={Style.sidebarLink} onClick={() => setMoreLinksOpen(false)}>
              <span><FaChartBar /></span>
              <p>Your Activity</p>
            </a>
          </Link>
          <Link href="/settings" legacyBehavior>
            <a className={Style.sidebarLink} onClick={() => setMoreLinksOpen(false)}>
              <span><FaCog /></span>
              <p>Settings</p>
            </a>
          </Link>
          <button className={Style.sidebarLink} onClick={handleLogout}>
            <span><FaSignOutAlt /></span>
            <p>Logout</p>
          </button>
        </div>
      )}
      <button className={Style.moreButton} onClick={toggleMoreLinks}>
        More <FaCaretDown />
      </button>
      {isSearchOpen && (
        <div className={Style.searchSidebar}>
          <button onClick={toggleSearchSidebar} className={Style.closeButton}>X</button>
          <div className={Style.searchInput}>
            <span><FaSearch /></span>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className={Style.line}></div>
          <div className={Style.searchResults}>
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div key={user._id} className={Style.searchResultItem} onClick={() => handleUserProfile(user._id)}>
                  <div className={Style.resultUserImage}>
                    <Image
                    src={user.profilePhoto}
                    alt=''
                    width={30}
                    height={30}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div className={Style.resultUserInfo}>
                  <p>{user.username}</p>
                  <p>{user.name}</p>
                  </div>
                  <div className={Style.resultUserFollower}>
                    <p>{user.followers?.length} followers</p>
                  </div>
                </div>
              ))
            ) : (
              <p className={Style.noResults}>No results found</p>
            )}
          </div>
        </div>
      )}

      {isNotificationsOpen && (
        <div className={Style.notificationSidebar}>
           <button onClick={toggleNotifications} className={Style.closeButton}>X</button>
           <h1 className={Style.contentTitle}>Notifications</h1>
        </div>
      )}
    </div>
  );
}
