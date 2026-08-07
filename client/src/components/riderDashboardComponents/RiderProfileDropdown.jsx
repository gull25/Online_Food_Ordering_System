import React, { useState, useEffect, useRef } from 'react';
import Icon from '../common/Icon';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { clearCart } from '../../redux/cartSlice';
import { APP_ROUTES } from '../../constants';

const RiderProfileDropdown = () => {
    const { user } = useSelector((state) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(clearCart());
        dispatch(logout());
        navigate(APP_ROUTES.HOME);
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-8 h-8 rounded-full overflow-hidden border border-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all block cursor-pointer"
            >
                <img 
                    className="w-full h-full object-cover pointer-events-none" 
                    alt="Rider avatar" 
                    src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDd8qT0mJdRhqlGl8fps7m-6X1GxAigqkHIpM7C0ZTXZq_ijtn9CnXPUA4q9K3gv-a-xUYLWalnG4M9LJn2klX2w_hzpQQmyVhg_M9rT17HxfwXFybJNMY1YW_Px5hEg-QmzjoQKnYHt6NSyvyfZI-81jTd5fLXuDcpkKqo6uE-vLt2omLuiiiP2Y8uedoqhslfxzv2eoDSc84DmOphH5lbVWilj_oXQ5iy-QJk778IwHUhGhgrEvNnig"}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg flex flex-col py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <button 
                        onClick={() => {
                            setIsOpen(false);
                            navigate('/profile');
                        }}
                        className="text-left px-4 py-3 hover:bg-surface-variant font-label text-label text-on-surface transition-colors cursor-pointer flex items-center gap-3 w-full"
                    >
                        <Icon name="manage_accounts" className="text-[18px]" />
                        Profile Setting
                    </button>
                    <div className="h-px bg-outline-variant/30 mx-3" />
                    <button
                        onClick={handleLogout}
                        className="text-left px-4 py-3 hover:bg-surface-variant font-label text-label text-error transition-colors cursor-pointer flex items-center gap-3 w-full"
                    >
                        <Icon name="logout" className="text-[18px]" />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default RiderProfileDropdown;
