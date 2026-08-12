import React, { useEffect, useState, useRef } from 'react';
import Icon from '../../../components/common/Icon';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveOrderThunk, confirmPickupThunk, confirmDeliveryThunk, acceptDeliveryThunk, startDeliveryThunk } from '../../../redux/riderSlice';
import { RiderPageSkeleton } from '../../../components/common/Skeleton';
import { socket, connectSocket, emitRiderLocation, joinRiderRoom } from '../../../helper/socket';
import LiveTracker from '../../../components/homeScreen/orderComponents/LiveTracker';
import { haversineMetres } from '../../../helper/osrm';
import { useApiAction } from '../../../hooks/useApiAction';

// Minimum movement (metres) before re-emitting GPS to socket
const GPS_EMIT_DISTANCE_M = 10;
// Minimum time (ms) between socket emissions
const GPS_EMIT_INTERVAL_MS = 3000;

const ActiveDeliveries = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { activeOrder, loading, error } = useSelector((state) => state.rider);
    const [gpsActive, setGpsActive] = useState(false);
    const [currentPos, setCurrentPos] = useState(null);
    const lastEmittedPos = useRef(null);
    const lastEmitTime = useRef(0);

    useEffect(() => {
        dispatch(fetchActiveOrderThunk());

        /*
         * The socket is created with `autoConnect: false`, and this screen never
         * opened it -- so every `socket.emit` below was queued into a connection
         * that was never established, and the live-tracking events it listens
         * for never arrived either. The rider's own room is joined here rather
         * than passed a client-supplied id; the server resolves it from the
         * session.
         */
        connectSocket();
        joinRiderRoom();

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
    // Throttled: only emits to socket when rider moves >GPS_EMIT_DISTANCE_M metres
    // OR GPS_EMIT_INTERVAL_MS have passed since the last emission — whichever
    // comes first. This prevents flooding the socket and the OSRM route API.
    useEffect(() => {
        let watchId;
        if (activeOrder && activeOrder.status === 'OUT_FOR_DELIVERY') {
            if (navigator.geolocation) {
                setGpsActive(true);
                lastEmittedPos.current = null;
                lastEmitTime.current = 0;

                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        const newPos = { lat: latitude, lng: longitude };
                        setCurrentPos(newPos);

                        const now = Date.now();
                        const movedM = haversineMetres(lastEmittedPos.current, newPos);
                        const timeSinceLast = now - lastEmitTime.current;

                        // Only emit if moved enough OR enough time passed
                        if (movedM >= GPS_EMIT_DISTANCE_M || timeSinceLast >= GPS_EMIT_INTERVAL_MS) {
                            // `riderId` is no longer sent: the server derives the
                            // courier from the authenticated socket, so a client
                            // cannot report a position on another rider's behalf.
                            emitRiderLocation({
                                orderId: activeOrder._id,
                                lat: latitude,
                                lng: longitude,
                            });
                            lastEmittedPos.current = newPos;
                            lastEmitTime.current = now;
                        }
                    },
                    (error) => {
                        console.error('GPS tracking error:', error);
                        setGpsActive(false);
                    },
                    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
                );
            }
        }
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            setGpsActive(false);
        };
    }, [activeOrder, user]);

    const { execute: handleAcceptDelivery, isSubmitting: isAccepting } = useApiAction(async () => {
        if (activeOrder) await dispatch(acceptDeliveryThunk(activeOrder._id)).unwrap();
    });

    const { execute: handleConfirmPickup, isSubmitting: isPickingUp } = useApiAction(async () => {
        if (activeOrder) await dispatch(confirmPickupThunk(activeOrder._id)).unwrap();
    });

    const { execute: handleStartDelivery, isSubmitting: isStarting } = useApiAction(async () => {
        if (activeOrder) await dispatch(startDeliveryThunk(activeOrder._id)).unwrap();
    });

    const { execute: handleConfirmDelivery, isSubmitting: isDelivering } = useApiAction(async () => {
        if (activeOrder) await dispatch(confirmDeliveryThunk(activeOrder._id)).unwrap();
    });

    const openNavigation = () => {
        if (activeOrder?.deliveryAddress?.lat && activeOrder?.deliveryAddress?.lng) {
            const { lat, lng } = activeOrder.deliveryAddress;
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        }
    };

    // First paint only. This page refetches on every `rider:new_delivery` and
    // `orderStatusUpdate` socket event; keying the skeleton purely off
    // `loading` made the entire screen — map included — drop to a skeleton and
    // rebuild each time one arrived.
    if (loading && !activeOrder) {
        return <RiderPageSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-error space-y-4 p-4 text-center">
                <Icon name="error" className="text-6xl" />
                <p className="font-inter text-xl font-semibold leading-7 text-on-background">Failed to load active deliveries.</p>
                <p className="text-label-md text-error bg-error/10 p-3 rounded-lg border border-error/20 max-w-md">{error}</p>
                <button 
                    onClick={() => dispatch(fetchActiveOrderThunk())} 
                    className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-bold mt-4 hover:bg-primary/90 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <main id="main-content" tabIndex={-1} className="flex-grow relative flex flex-col pb-20 lg:pb-0">
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
                            <img 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAk_NcAG8nNeDphk4IyLivG799dFcwW08rfVNuQwdFJsVj9Lbg43fqkhkxv-WOmcjTwkZC3XkFhtLpbxcDNo6xpiEwiMqjdjeKNjDs79RmD7o3jntMuTSPCbFhrryNIpLydoN9_cDuSek_3ohI_hFBWl_d1OX_9dORC4U9C65zY3GdQ9LHRB0U_-Ytk2VzestbmLKZhN8HRWxOl1W0S1UdmbXIelsZpeukoTCSdPTIqLOSbeEAn9OjmSg" 
                                alt="Map Placeholder" 
                                className="w-full h-full object-cover grayscale opacity-30" 
                            />
                        )}
                        {/* UI Overlays for the Map */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent from-0% to-40% pointer-events-none"></div>
                        {/* The "recentre" and "layers" buttons that sat here had no
                            onClick handler at all -- they looked like map controls and
                            did nothing when tapped. Removed rather than left as
                            decoration a rider would reach for mid-delivery. */}
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
                                            <span className="flex items-center gap-1 text-[12px] font-bold uppercase text-on-success-container bg-success-container px-2 py-1 rounded-full">
                                                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                                                Live GPS
                                            </span>
                                        )}
                                        <span className="text-secondary font-inter text-xs font-bold leading-4">Est. ${(activeOrder.riderEarning || (activeOrder.totalAmount * 0.10) || 0).toFixed(2)} Earned</span>
                                    </div>
                                </div>
                                <h3 className="font-inter text-xl font-semibold leading-7 text-on-background">Order #{activeOrder?._id?.toString()?.slice(-4)?.toUpperCase() || 'ID'}</h3>
                                <p className="font-inter text-sm font-normal leading-5 text-on-surface-variant">{activeOrder.restaurant?.name || 'Restaurant'}</p>
                            </div>
                        ) : (
                            <div className="p-container-margin border-b border-outline-variant bg-surface-container-low">
                                <h3 className="font-inter text-xl font-semibold leading-7 text-on-background">No Active Delivery</h3>
                                <p className="font-inter text-sm font-normal leading-5 text-on-surface-variant">You are currently waiting for an assignment.</p>
                            </div>
                        )}

                        {/* Scrollable Content */}
                        <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-surface-container-low [&::-webkit-scrollbar-thumb]:bg-outline-variant [&::-webkit-scrollbar-thumb]:rounded-sm p-container-margin space-y-6">
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
                                                    <Icon name="person" className="text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-inter text-xs font-bold leading-4 text-on-background">{activeOrder.user?.name || 'Customer'}</p>
                                                    <p className="font-inter text-[12px] font-medium leading-[14px] text-on-surface-variant">{activeOrder.deliveryAddress?.instructions || 'No instructions'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {/* Was a button with no handler. The customer's
                                                    number is already on the order, so it is a real
                                                    `tel:` link now -- and hidden entirely when there
                                                    is no number to call. */}
                                                {activeOrder.user?.phone && (
                                                    <a
                                                        href={`tel:${activeOrder.user.phone}`}
                                                        aria-label={`Call ${activeOrder.user?.name || 'the customer'}`}
                                                        className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant transition-transform active:scale-95 hover:border-primary"
                                                    >
                                                        <Icon name="call" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-stack-md pt-stack-sm">
                                        <button onClick={openNavigation} className="w-full bg-primary-container text-on-primary-container font-label-bold text-headline-md-mobile py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/10">
                                            <Icon name="navigation" />
                                            START NAVIGATION
                                        </button>
                                        
                                        {activeOrder.status === 'RIDER_ASSIGNED' && (
                                            <div className="flex gap-2">
                                                <button disabled={isAccepting} onClick={handleAcceptDelivery} className="flex-1 bg-primary text-on-primary font-inter text-xs font-bold leading-4 py-4 rounded-xl border border-outline-variant transition-transform active:scale-95 disabled:opacity-50 flex justify-center items-center gap-1">
                                                    {isAccepting && <Icon name="sync" className="animate-spin text-sm" />} ACCEPT
                                                </button>
                                                <button disabled={isPickingUp} onClick={handleConfirmPickup} className="flex-1 bg-surface-container-highest text-on-surface font-inter text-xs font-bold leading-4 py-4 rounded-xl border border-outline-variant transition-transform active:scale-95 disabled:opacity-50 flex justify-center items-center gap-1">
                                                    {isPickingUp && <Icon name="sync" className="animate-spin text-sm" />} CONFIRM PICKUP
                                                </button>
                                            </div>
                                        )}
                                        {activeOrder.status === 'PICKED_UP' && (
                                            <button disabled={isStarting} onClick={handleStartDelivery} className="w-full bg-surface-container-highest text-on-surface font-inter text-xs font-bold leading-4 py-4 rounded-xl border border-outline-variant transition-transform active:scale-95 disabled:opacity-50 flex justify-center items-center gap-1">
                                                {isStarting && <Icon name="sync" className="animate-spin text-sm" />} START DELIVERY
                                            </button>
                                        )}
                                        {activeOrder.status === 'OUT_FOR_DELIVERY' && (
                                            <button disabled={isDelivering} onClick={handleConfirmDelivery} className="w-full bg-secondary-container text-on-secondary-container font-inter text-xs font-bold leading-4 py-4 rounded-xl border border-outline-variant transition-transform active:scale-95 disabled:opacity-50 flex justify-center items-center gap-1">
                                                {isDelivering && <Icon name="sync" className="animate-spin text-sm" />} CONFIRM DELIVERY
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 pt-10">
                                    <Icon name="inbox" className="text-6xl text-on-surface-variant opacity-60" />
                                    <p className="text-on-surface font-body-md text-center">No active deliveries at this moment.</p>
                                </div>
                            )}
                        </div>

                        {/* Emergency Contact Footer */}
                        <div className="p-4 border-t border-outline-variant bg-surface-container-low">
                            <button className="w-full flex items-center justify-center gap-2 text-error font-inter text-xs font-bold leading-4 py-2 hover:bg-error/10 transition-colors rounded-lg">
                                <Icon name="emergency" />
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
