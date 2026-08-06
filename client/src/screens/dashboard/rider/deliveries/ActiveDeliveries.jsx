import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveOrderThunk, confirmPickupThunk, confirmDeliveryThunk, acceptDeliveryThunk, startDeliveryThunk } from '../../../../redux/riderSlice';
import { socket } from '../../../../helper/socket';
import LiveTracker from '../../../../components/homeScreen/orderComponents/LiveTracker';

const ActiveDeliveries = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { activeOrder, loading, error } = useSelector((state) => state.rider);
    const [gpsActive, setGpsActive] = useState(false);
    const [currentPos, setCurrentPos] = useState(null);

    useEffect(() => {
        dispatch(fetchActiveOrderThunk());

        if (socket) {
            socket.on('rider:new_delivery', () => {
                dispatch(fetchActiveOrderThunk());
            });
            socket.on('orderStatusUpdate', () => {
                dispatch(fetchActiveOrderThunk());
            });
        }
        return () => {
            if (socket) {
                socket.off('rider:new_delivery');
                socket.off('orderStatusUpdate');
            }
        };
    }, [dispatch]);

    // Live GPS Sharing when OUT_FOR_DELIVERY
    useEffect(() => {
        let watchId;
        if (activeOrder && activeOrder.status === 'OUT_FOR_DELIVERY') {
            if (navigator.geolocation) {
                setGpsActive(true);
                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setCurrentPos({ lat: latitude, lng: longitude });
                        
                        if (socket) {
                            socket.emit('rider:location_update', {
                                orderId: activeOrder._id,
                                riderId: user?._id,
                                lat: latitude,
                                lng: longitude
                            });
                        }
                    },
                    (error) => {
                        console.error('GPS tracking error:', error);
                        setGpsActive(false);
                    },
                    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                );
            }
        }
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            setGpsActive(false);
        };
    }, [activeOrder, user]);

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

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-primary"><span className="material-symbols-outlined animate-spin text-4xl">sync</span></div>;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-error space-y-4 p-4 text-center">
                <span className="material-symbols-outlined text-6xl">error</span>
                <p className="font-inter text-xl font-semibold leading-7 text-on-background">Failed to load active deliveries.</p>
                <p className="text-label-md text-error bg-error/10 p-3 rounded-lg border border-error/20 max-w-md">{error}</p>
                <button 
                    onClick={() => dispatch(fetchActiveOrderThunk())} 
                    className="px-6 py-2 bg-primary text-white rounded-lg font-label-bold mt-4 hover:bg-primary/90 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <main className="flex-grow relative flex flex-col pb-20 lg:pb-0">
                <div className="absolute inset-0 z-0">
                    <div className="w-full h-full bg-surface-dim relative">
                        {/* Interactive Map */}
                        {activeOrder ? (
                            <LiveTracker
                                orderId={activeOrder._id}
                                restaurantLocation={activeOrder.restaurant?.location}
                                customerLocation={activeOrder.deliveryAddress}
                                initialRiderLocation={currentPos}
                                isRiderView={true}
                            />
                        ) : (
                            <div className="w-full h-full grayscale opacity-40 mix-blend-screen" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAk_NcAG8nNeDphk4IyLivG799dFcwW08rfVNuQwdFJsVj9Lbg43fqkhkxv-WOmcjTwkZC3XkFhtLpbxcDNo6xpiEwiMqjdjeKNjDs79RmD7o3jntMuTSPCbFhrryNIpLydoN9_cDuSek_3ohI_hFBWl_d1OX_9dORC4U9C65zY3GdQ9LHRB0U_-Ytk2VzestbmLKZhN8HRWxOl1W0S1UdmbXIelsZpeukoTCSdPTIqLOSbeEAn9OjmSg')" }}></div>
                        )}
                        {/* UI Overlays for the Map */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9ff] to-transparent from-0% to-40% pointer-events-none"></div>
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
                                    <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-inter text-xs font-bold leading-4 uppercase">
                                        {activeOrder.status}
                                    </span>
                                    <div className="flex gap-2 items-center">
                                        {gpsActive && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-green-600 bg-green-100 px-2 py-1 rounded-full animate-pulse">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                Live GPS
                                            </span>
                                        )}
                                        <span className="text-secondary font-inter text-xs font-bold leading-4">Est. €{(activeOrder.riderEarning || (activeOrder.totalAmount * 0.10) || 0).toFixed(2)} Earned</span>
                                    </div>
                                </div>
                                <h3 className="font-inter text-xl font-semibold leading-7 text-on-background">Order #{activeOrder?._id?.toString()?.slice(-4)?.toUpperCase() || 'ID'}</h3>
                                <p className="font-inter text-sm font-normal leading-5 text-on-surface-variant">{activeOrder.restaurant?.name || 'Restaurant'}</p>
                            </div>
                        ) : (
                            <div className="p-container-margin border-b border-outline-variant bg-surface-container-high">
                                <h3 className="font-inter text-xl font-semibold leading-7 text-on-background">No Active Delivery</h3>
                                <p className="font-inter text-sm font-normal leading-5 text-on-surface-variant">You are currently waiting for an assignment.</p>
                            </div>
                        )}

                        {/* Scrollable Content */}
                        <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[#eef4ff] [&::-webkit-scrollbar-thumb]:bg-[#dce3f0] [&::-webkit-scrollbar-thumb]:rounded-sm p-container-margin space-y-6">
                            {activeOrder ? (
                                <>
                                    {/* Progress Tracker */}
                                    <div className="flex items-center gap-4 py-2">
                                        <div className="flex flex-col items-center gap-unit">
                                            <div className="w-3 h-3 rounded-full bg-secondary"></div>
                                            <div className="w-0.5 h-10 bg-outline-variant"></div>
                                            <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20"></div>
                                        </div>
                                        <div className="flex flex-col justify-between h-20 py-1">
                                            <div>
                                                <p className="font-inter text-xs font-bold leading-4 text-on-surface-variant uppercase tracking-wider">Pickup</p>
                                                <p className="font-inter text-base font-normal leading-6">{activeOrder.restaurant?.address || 'Restaurant Address'}</p>
                                            </div>
                                            <div>
                                                <p className="font-inter text-xs font-bold leading-4 text-primary uppercase tracking-wider">Drop-off</p>
                                                <p className="font-inter text-base font-normal leading-6">{activeOrder.deliveryAddress?.streetAddress || 'Delivery Address'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="bg-surface-container p-4 rounded-xl border border-outline-variant">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center border border-outline-variant">
                                                    <span className="material-symbols-outlined text-primary">person</span>
                                                </div>
                                                <div>
                                                    <p className="font-inter text-xs font-bold leading-4 text-on-background">{activeOrder.user?.name || 'Customer'}</p>
                                                    <p className="font-inter text-[11px] font-medium leading-[14px] text-on-surface-variant">{activeOrder.deliveryAddress?.instructions || 'No instructions'}</p>
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
                                        
                                        {activeOrder.status === 'RIDER_ASSIGNED' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => dispatch(acceptDeliveryThunk(activeOrder._id))} className="flex-1 bg-primary text-white font-inter text-xs font-bold leading-4 py-4 rounded-xl border border-outline-variant transition-transform active:scale-95">
                                                    ACCEPT
                                                </button>
                                                <button onClick={() => dispatch(confirmPickupThunk(activeOrder._id))} className="flex-1 bg-surface-container-highest text-on-surface font-inter text-xs font-bold leading-4 py-4 rounded-xl border border-outline-variant transition-transform active:scale-95">
                                                    CONFIRM PICKUP
                                                </button>
                                            </div>
                                        )}
                                        {activeOrder.status === 'PICKED_UP' && (
                                            <button onClick={() => dispatch(startDeliveryThunk(activeOrder._id))} className="w-full bg-surface-container-highest text-on-surface font-inter text-xs font-bold leading-4 py-4 rounded-xl border border-outline-variant transition-transform active:scale-95">
                                                START DELIVERY
                                            </button>
                                        )}
                                        {activeOrder.status === 'OUT_FOR_DELIVERY' && (
                                            <button onClick={() => dispatch(confirmDeliveryThunk(activeOrder._id))} className="w-full bg-secondary-container text-on-secondary-container font-inter text-xs font-bold leading-4 py-4 rounded-xl border border-outline-variant transition-transform active:scale-95">
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
                        <div className="p-4 border-t border-outline-variant bg-surface-dim">
                            <button className="w-full flex items-center justify-center gap-2 text-error font-inter text-xs font-bold leading-4 py-2 hover:bg-error/10 transition-colors rounded-lg">
                                <span className="material-symbols-outlined">emergency</span>
                                REPORT AN ISSUE
                            </button>
                        </div>
                    </div>
                    
                    {/* Empty space for Desktop Map Visibility */}
                    <div className="flex-grow pointer-events-none hidden lg:block"></div>
                </div>
            </main>
    );
};

export default ActiveDeliveries;
