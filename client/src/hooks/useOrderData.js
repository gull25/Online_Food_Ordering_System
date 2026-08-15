import { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchOrderByIdThunk,
  fetchMyOrdersThunk,
  setCurrentOrder
} from '../redux/orderSlice';
import { isActiveOrder } from '../constants/orderStatus';
import { APP_ROUTES } from '../constants';

export const useOrderData = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentOrder: order, orders, loading, mutating, error } = useSelector((state) => state.orders);

  // Fetch specific order if orderId is present in URL
  useEffect(() => {
    if (orderId) {
      dispatch(setCurrentOrder(null));
      dispatch(fetchOrderByIdThunk(orderId));
    }
    return () => {
      dispatch(setCurrentOrder(null));
    };
  }, [dispatch, orderId]);

  // If no orderId, fetch user's orders to show the picker
  useEffect(() => {
    if (!orderId) dispatch(fetchMyOrdersThunk());
  }, [dispatch, orderId]);

  // Filter for active orders
  const trackableOrders = useMemo(
    () => (orders || []).filter((o) => isActiveOrder(o.status)),
    [orders]
  );

  // Auto-navigate if exactly one active order and no orderId selected
  useEffect(() => {
    if (!orderId && trackableOrders.length === 1) {
      navigate(`${APP_ROUTES.TRACK_ORDER}?orderId=${trackableOrders[0]._id}`, { replace: true });
    }
  }, [orderId, trackableOrders, navigate]);

  return { orderId, order, orders, loading, mutating, error, trackableOrders };
};
