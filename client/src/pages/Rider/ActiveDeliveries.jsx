import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveOrderThunk, confirmPickupThunk, confirmDeliveryThunk } from '../../features/rider/riderSlice';
import socketManager from '../../utils/socket';
import OrderMap from '../Orders/components/OrderMap';
import './RiderTheme.css';

const ActiveDeliveries = () => {
    const dispatch = useDispatch();
    const { activeOrder, loading } = useSelector((state) => state.rider);

    useEffect(() => {
        dispatch(fetchActiveOrderThunk());

        const socket = socketManager.getSocket();
        if (socket) {
            socket.on('rider:new_order', () => {
                dispatch(fetchActiveOrderThunk());
            });
            socket.on('orderStatusUpdate', () => {
                dispatch(fetchActiveOrderThunk());
            });
        }
        return () => {
            if (socket) {
                socket.off('rider:new_order');
                socket.off('orderStatusUpdate');
            }
        };
    }, [dispatch]);

    const handleConfirmPickup = () => {
        if (activeOrder) dispatch(confirmPickupThunk(activeOrder._id));
    };

    const handleConfirmDelivery = () => {
        if (activeOrder) dispatch(confirmDeliveryThunk(activeOrder._id));
    };

    const openNavigation = () => {
        if (activeOrder?.deliveryAddress?.lat && activeOrder?.deliveryAddress?.lng) {
            const { lat, lng } = activeOrder.deliveryAddress;
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        }
    };

    return (
        <div className="rider-theme flex flex-col lg:flex-row min-h-screen bg-background text-on-background dark">
            {/* SideNavBar (Desktop Only) */}
            <aside className="fixed left-0 top-0 h-full w-64 hidden lg:flex flex-col bg-surface border-r border-outline-variant py-stack-lg z-50">
                <div className="px-container-margin mb-stack-lg">
                    <h1 className="font-headline-md text-headline-md font-bold text-primary">Rider Dashboard</h1>
                    <p className="font-label-bold text-label-bold text-on-surface-variant opacity-70">Utility Logistics</p>
                </div>
                <nav className="flex-grow space-y-unit px-2">
                    <Link to="/rider/dashboard" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95 font-label-bold text-label-bold">
                        <span className="material-symbols-outlined">dashboard</span>
                        <span>Overview</span>
                    </Link>
                    <Link to="/rider/active-deliveries" className="flex items-center gap-3 px-4 py-3 text-primary font-bold border-l-4 border-primary bg-surface-container-high transition-transform active:scale-95 font-label-bold text-label-bold">
                        <span className="material-symbols-outlined">local_shipping</span>
                        <span>Active Deliveries</span>
                    </Link>
                    <Link to="/rider/earnings" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95 font-label-bold text-label-bold">
                        <span className="material-symbols-outlined">payments</span>
                        <span>Earnings</span>
                    </Link>
                    <Link to="/rider/ratings" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95 font-label-bold text-label-bold">
                        <span className="material-symbols-outlined">star</span>
                        <span>Ratings</span>
                    </Link>
                    <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95 font-label-bold text-label-bold" href="#">
                        <span className="material-symbols-outlined">settings</span>
                        <span>Settings</span>
                    </a>
                </nav>
                <div className="mt-auto px-4 border-t border-outline-variant pt-stack-md">
                    <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg font-label-bold text-label-bold" href="#">
                        <span className="material-symbols-outlined">help</span>
                        <span>Help Center</span>
                    </a>
                </div>
            </aside>

            {/* TopAppBar (Mobile Only) */}
            <header className="fixed top-0 w-full z-50 lg:hidden flex justify-between items-center px-container-margin py-stack-sm bg-background border-b border-outline-variant">
                <div className="flex items-center gap-2">
                    <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">Foodora Rider</h2>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-primary"><span className="material-symbols-outlined">notifications</span></button>
                    <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-outline">
                        <img 
                            className="w-full h-full object-cover" 
                            alt="Rider avatar" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkPZFBt9mGnIqULxFeFfpMxuOKxyqlvCgNyoG_yMusAWaAYlAPSXVoPv1AMw2xte5pl3PvN12GeNRavkRnVqkUEMMZPVx2AavbOTH_G7fVD1HNaiHHLWDTS6Zxi4HMhfAKGYhVi1ouPBRKmF1_EELFLZ4Hs6kxZkmL0fWZBXuaRmzRbQ6PGmmQEYTvTfTwhi4-daBm6hNjwGFVGK3cxxM3fcogLBrO6zB3yjfGarJKkCYKWG2laJEYGg"
                        />
                    </div>
                </div>
            </header>

            {/* Main Content Canvas */}
            <main className="flex-grow lg:ml-64 relative flex flex-col pt-14 lg:pt-0 pb-20 lg:pb-0">
                <div className="absolute inset-0 z-0">
                    <div className="w-full h-full bg-surface-dim relative">
                        {/* Interactive Map */}
                        {activeOrder ? (
                            <OrderMap
                                restaurantLocation={activeOrder.restaurant?.location}
                                customerLocation={activeOrder.deliveryAddress}
                                riderLocation={null} // Can be added later if rider GPS is tracked
                                restaurantName={activeOrder.restaurant?.name}
                            />
                        ) : (
                            <div className="w-full h-full grayscale opacity-40 mix-blend-screen" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAk_NcAG8nNeDphk4IyLivG799dFcwW08rfVNuQwdFJsVj9Lbg43fqkhkxv-WOmcjTwkZC3XkFhtLpbxcDNo6xpiEwiMqjdjeKNjDs79RmD7o3jntMuTSPCbFhrryNIpLydoN9_cDuSek_3ohI_hFBWl_d1OX_9dORC4U9C65zY3GdQ9LHRB0U_-Ytk2VzestbmLKZhN8HRWxOl1W0S1UdmbXIelsZpeukoTCSdPTIqLOSbeEAn9OjmSg')" }}></div>
                        )}
                        {/* UI Overlays for the Map */}
                        <div className="absolute inset-0 map-gradient-overlay pointer-events-none"></div>
                        {/* Floating Map Controls */}
                        <div className="absolute top-4 right-4 flex-col gap-2 z-10 hidden lg:flex">
                            <button className="bg-surface-container-high p-3 rounded-lg border border-outline-variant shadow-lg text-on-surface hover:bg-surface-bright">
                                <span className="material-symbols-outlined">my_location</span>
                            </button>
                            <button className="bg-surface-container-high p-3 rounded-lg border border-outline-variant shadow-lg text-on-surface hover:bg-surface-bright">
                                <span className="material-symbols-outlined">layers</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Foreground Interface */}
                <div className="relative z-10 flex flex-col lg:flex-row h-full max-h-screen">
                    {/* Mobile Toggle Sheet / Task Panel */}
                    <div className="mt-auto lg:mt-0 w-full lg:w-[420px] bg-background lg:bg-background/80 lg:backdrop-blur-xl lg:border-r border-outline-variant flex flex-col h-[70vh] lg:h-full shadow-2xl overflow-hidden">
                        {/* Task Header */}
                        {activeOrder ? (
                            <div className="p-container-margin border-b border-outline-variant bg-surface-container-high">
                                <div className="flex justify-between items-start mb-stack-sm">
                                    <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-bold text-label-bold uppercase">
                                        {activeOrder.status}
                                    </span>
                                    <div className="flex gap-2">
                                        <span className="text-secondary font-label-bold text-label-bold">Est. €{(activeOrder.totalAmount * 0.10).toFixed(2)} Earned</span>
                                    </div>
                                </div>
                                <h3 className="font-headline-md text-headline-md text-on-background">Order #{activeOrder._id.toString().slice(-4).toUpperCase()}</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">{activeOrder.restaurant?.name || 'Restaurant'}</p>
                            </div>
                        ) : (
                            <div className="p-container-margin border-b border-outline-variant bg-surface-container-high">
                                <h3 className="font-headline-md text-headline-md text-on-background">No Active Delivery</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">You are currently waiting for an assignment.</p>
                            </div>
                        )}

                        {/* Scrollable Content */}
                        <div className="flex-grow overflow-y-auto custom-scrollbar p-container-margin space-y-stack-lg">
                            {activeOrder ? (
                                <>
                                    {/* Progress Tracker */}
                                    <div className="flex items-center gap-stack-md py-stack-sm">
                                        <div className="flex flex-col items-center gap-unit">
                                            <div className="w-3 h-3 rounded-full bg-secondary"></div>
                                            <div className="w-0.5 h-10 bg-outline-variant"></div>
                                            <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20"></div>
                                        </div>
                                        <div className="flex flex-col justify-between h-20 py-1">
                                            <div>
                                                <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Pickup</p>
                                                <p className="font-body-lg text-body-lg">{activeOrder.restaurant?.address || 'Restaurant Address'}</p>
                                            </div>
                                            <div>
                                                <p className="font-label-bold text-label-bold text-primary uppercase tracking-wider">Drop-off</p>
                                                <p className="font-body-lg text-body-lg">{activeOrder.deliveryAddress?.streetAddress || 'Delivery Address'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="bg-surface-container p-stack-md rounded-xl border border-outline-variant">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center border border-outline-variant">
                                                    <span className="material-symbols-outlined text-primary">person</span>
                                                </div>
                                                <div>
                                                    <p className="font-label-bold text-label-bold text-on-background">{activeOrder.user?.name || 'Customer'}</p>
                                                    <p className="font-label-sm text-label-sm text-on-surface-variant">{activeOrder.deliveryAddress?.instructions || 'No instructions'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant transition-transform active:scale-95">
                                                    <span className="material-symbols-outlined">call</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-stack-md pt-stack-sm">
                                        <button onClick={openNavigation} className="w-full bg-primary-container text-on-primary-container font-label-bold text-headline-md-mobile py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/10">
                                            <span className="material-symbols-outlined">navigation</span>
                                            START NAVIGATION
                                        </button>
                                        
                                        {activeOrder.status === 'Out For Delivery' ? (
                                            <button onClick={handleConfirmPickup} className="w-full bg-surface-container-highest text-on-surface font-label-bold text-label-bold py-4 rounded-xl border border-outline-variant transition-transform active:scale-95">
                                                CONFIRM PICKUP
                                            </button>
                                        ) : (
                                            <button onClick={handleConfirmDelivery} className="w-full bg-secondary-container text-on-secondary-container font-label-bold text-label-bold py-4 rounded-xl border border-outline-variant transition-transform active:scale-95">
                                                CONFIRM DELIVERY
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4 pt-10">
                                    <span className="material-symbols-outlined text-6xl text-on-surface-variant">inbox</span>
                                    <p className="text-on-surface-variant font-body-md text-center">No active deliveries at this moment.</p>
                                </div>
                            )}
                        </div>

                        {/* Emergency Contact Footer */}
                        <div className="p-stack-md border-t border-outline-variant bg-surface-dim">
                            <button className="w-full flex items-center justify-center gap-2 text-error font-label-bold text-label-bold py-2 hover:bg-error/10 transition-colors rounded-lg">
                                <span className="material-symbols-outlined">emergency</span>
                                REPORT AN ISSUE
                            </button>
                        </div>
                    </div>
                    
                    {/* Empty space for Desktop Map Visibility */}
                    <div className="flex-grow pointer-events-none hidden lg:block"></div>
                </div>
            </main>

            {/* BottomNavBar (Mobile Only) */}
            <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-4 pt-2 bg-surface border-t border-outline-variant lg:hidden shadow-lg">
                <Link to="/rider/dashboard" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:bg-surface-container-highest transition-transform duration-150 scale-95">
                    <span className="material-symbols-outlined">home</span>
                    <span className="font-label-sm text-label-sm-mobile">Home</span>
                </Link>
                <Link to="/rider/active-deliveries" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 transition-transform duration-150 scale-95">
                    <span className="material-symbols-outlined fill-icon" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
                    <span className="font-label-sm text-label-sm-mobile">Tasks</span>
                </Link>
                <Link to="/rider/earnings" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:bg-surface-container-highest transition-transform duration-150 scale-95">
                    <span className="material-symbols-outlined">payments</span>
                    <span className="font-label-sm text-label-sm-mobile">Earnings</span>
                </Link>
                <a className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:bg-surface-container-highest transition-transform duration-150 scale-95" href="#">
                    <span className="material-symbols-outlined">person</span>
                    <span className="font-label-sm text-label-sm-mobile">Profile</span>
                </a>
            </nav>
        </div>
    );
};

export default ActiveDeliveries;
