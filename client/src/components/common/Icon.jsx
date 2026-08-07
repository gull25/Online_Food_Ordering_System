import React from 'react';
import {
  MdAccountBalance, MdAccountBalanceWallet, MdAccountCircle, MdAdd,
  MdAddCircle, MdAlternateEmail, MdAnalytics, MdArrowBack,
  MdArrowForward, MdAutorenew, MdBolt, MdCall,
  MdCampaign, MdCancel, MdCategory, MdChat,
  MdCheck, MdCheckCircle, MdChevronLeft, MdChevronRight,
  MdClose, MdConfirmationNumber, MdContentCopy, MdCreditCard,
  MdDarkMode, MdDashboard, MdDelete, MdDeliveryDining,
  MdDoNotDisturbOn, MdDoorFront, MdDownload, MdEco,
  MdEdit, MdEmergency, MdError, MdExpandLess,
  MdExpandMore, MdExplore, MdFastfood, MdFavorite,
  MdFiberManualRecord, MdGroup, MdHistory, MdHome,
  MdInbox, MdInfo, MdInventory2, MdLanguage,
  MdLayers, MdLightMode, MdLocalFireDepartment, MdLocalOffer,
  MdLocalPizza, MdLocalShipping, MdLocationOff, MdLocationOn,
  MdLocationSearching, MdLock, MdLogin, MdLogout,
  MdMail, MdManageAccounts, MdMenu, MdMenuBook,
  MdMoreVert, MdMotionPhotosOn, MdMyLocation, MdNavigation,
  MdOpenInNew, MdOutlineAccountBalance, MdOutlineAccountBalanceWallet, MdOutlineAccountCircle,
  MdOutlineAdd, MdOutlineAddCircle, MdOutlineAlternateEmail, MdOutlineAnalytics,
  MdOutlineArrowBack, MdOutlineArrowForward, MdOutlineAutorenew, MdOutlineBolt,
  MdOutlineCall, MdOutlineCampaign, MdOutlineCancel, MdOutlineCategory,
  MdOutlineChat, MdOutlineCheck, MdOutlineCheckCircle, MdOutlineChevronLeft,
  MdOutlineChevronRight, MdOutlineClose, MdOutlineConfirmationNumber, MdOutlineContentCopy,
  MdOutlineCreditCard, MdOutlineDarkMode, MdOutlineDashboard, MdOutlineDelete,
  MdOutlineDeliveryDining, MdOutlineDoNotDisturbOn, MdOutlineDoorFront, MdOutlineDownload,
  MdOutlineEco, MdOutlineEdit, MdOutlineEmergency, MdOutlineError,
  MdOutlineExpandLess, MdOutlineExpandMore, MdOutlineExplore, MdOutlineFastfood,
  MdOutlineFavorite, MdOutlineFiberManualRecord, MdOutlineGroup, MdOutlineHistory,
  MdOutlineHome, MdOutlineInbox, MdOutlineInfo, MdOutlineInventory2,
  MdOutlineLanguage, MdOutlineLayers, MdOutlineLightMode, MdOutlineLocalFireDepartment,
  MdOutlineLocalOffer, MdOutlineLocalPizza, MdOutlineLocalShipping, MdOutlineLocationOff,
  MdOutlineLocationOn, MdOutlineLocationSearching, MdOutlineLock, MdOutlineLogin,
  MdOutlineLogout, MdOutlineMail, MdOutlineManageAccounts, MdOutlineMenu,
  MdOutlineMenuBook, MdOutlineMoreVert, MdOutlineMotionPhotosOn, MdOutlineMyLocation,
  MdOutlineNavigation, MdOutlineOpenInNew, MdOutlinePause, MdOutlinePayments,
  MdOutlinePerson, MdOutlinePhoneInTalk, MdOutlinePhoneIphone, MdOutlinePhotoCamera,
  MdOutlinePlayArrow, MdOutlinePlayCircle, MdOutlinePublic, MdOutlineReceiptLong,
  MdOutlineRemove, MdOutlineRemoveShoppingCart, MdOutlineReplay, MdOutlineRestaurant,
  MdOutlineRestaurantMenu, MdOutlineSave, MdOutlineSchedule, MdOutlineSearch,
  MdOutlineSearchOff, MdOutlineSentimentDissatisfied, MdOutlineSettings, MdOutlineShare,
  MdOutlineShoppingBag, MdOutlineShoppingCart, MdOutlineStar, MdOutlineStarHalf,
  MdOutlineStarRate, MdOutlineStars, MdOutlineStorefront, MdOutlineSync,
  MdOutlineThumbUp, MdOutlineTrendingDown, MdOutlineTrendingUp, MdOutlineTwoWheeler,
  MdOutlineVerifiedUser, MdOutlineVisibility, MdOutlineVisibilityOff, MdPause,
  MdPayments, MdPerson, MdPhoneInTalk, MdPhoneIphone,
  MdPhotoCamera, MdPlayArrow, MdPlayCircle, MdPublic,
  MdReceiptLong, MdRemove, MdRemoveShoppingCart, MdReplay,
  MdRestaurant, MdRestaurantMenu, MdSave, MdSchedule,
  MdSearch, MdSearchOff, MdSentimentDissatisfied, MdSettings,
  MdShare, MdShoppingBag, MdShoppingCart, MdStar,
  MdStarHalf, MdStarRate, MdStars, MdStorefront,
  MdSync, MdThumbUp, MdTrendingDown, MdTrendingUp,
  MdTwoWheeler, MdVerifiedUser, MdVisibility, MdVisibilityOff,
  MdFilterList, MdOutlineFilterList,
} from 'react-icons/md';

/**
 * Icon — the app's single icon surface, backed by react-icons.
 *
 * This replaces the Material Symbols webfont. That font drew icons from
 * ligatures, so the markup literally read
 * `<span class="material-symbols-outlined">receipt_long</span>`. Until the
 * 1.1MB font finished downloading, the browser painted the ligature name as
 * plain text — which is why the sidebar and toolbars spelled out "dashboard",
 * "receipt_long" and "expand_less" on every cold load. SVG components have no
 * such failure mode: there is no font to fetch, and nothing renders until the
 * icon itself renders.
 *
 * Names stay as the original Material Symbol tokens so call sites read the same
 * and data tables (sidebar links, footer socials) keep working untouched. Each
 * maps to an outline and a filled variant; outline is the default because that
 * is what the design used.
 *
 * Sizing follows font-size — react-icons render at 1em — so existing utilities
 * such as text-[18px] and text-4xl keep controlling icon size exactly as before.
 */
const ICONS = {
  'account_balance': [MdOutlineAccountBalance, MdAccountBalance],
  'account_balance_wallet': [MdOutlineAccountBalanceWallet, MdAccountBalanceWallet],
  'account_circle': [MdOutlineAccountCircle, MdAccountCircle],
  'add': [MdOutlineAdd, MdAdd],
  'add_circle': [MdOutlineAddCircle, MdAddCircle],
  'alternate_email': [MdOutlineAlternateEmail, MdAlternateEmail],
  'analytics': [MdOutlineAnalytics, MdAnalytics],
  'arrow_back': [MdOutlineArrowBack, MdArrowBack],
  'arrow_forward': [MdOutlineArrowForward, MdArrowForward],
  'bolt': [MdOutlineBolt, MdBolt],
  'call': [MdOutlineCall, MdCall],
  'campaign': [MdOutlineCampaign, MdCampaign],
  'cancel': [MdOutlineCancel, MdCancel],
  'category': [MdOutlineCategory, MdCategory],
  'chat': [MdOutlineChat, MdChat],
  'check': [MdOutlineCheck, MdCheck],
  'check_circle': [MdOutlineCheckCircle, MdCheckCircle],
  'chevron_left': [MdOutlineChevronLeft, MdChevronLeft],
  'chevron_right': [MdOutlineChevronRight, MdChevronRight],
  'close': [MdOutlineClose, MdClose],
  'confirmation_number': [MdOutlineConfirmationNumber, MdConfirmationNumber],
  'content_copy': [MdOutlineContentCopy, MdContentCopy],
  'credit_card': [MdOutlineCreditCard, MdCreditCard],
  'dark_mode': [MdOutlineDarkMode, MdDarkMode],
  'dashboard': [MdOutlineDashboard, MdDashboard],
  'delete': [MdOutlineDelete, MdDelete],
  'delivery_dining': [MdOutlineDeliveryDining, MdDeliveryDining],
  'door_front': [MdOutlineDoorFront, MdDoorFront],
  'download': [MdOutlineDownload, MdDownload],
  'eco': [MdOutlineEco, MdEco],
  'edit': [MdOutlineEdit, MdEdit],
  'emergency': [MdOutlineEmergency, MdEmergency],
  'error': [MdOutlineError, MdError],
  'expand_less': [MdOutlineExpandLess, MdExpandLess],
  'expand_more': [MdOutlineExpandMore, MdExpandMore],
  'explore': [MdOutlineExplore, MdExplore],
  'filter_list': [MdOutlineFilterList, MdFilterList],
  'fastfood': [MdOutlineFastfood, MdFastfood],
  'favorite': [MdOutlineFavorite, MdFavorite],
  'fiber_manual_record': [MdOutlineFiberManualRecord, MdFiberManualRecord],
  'group': [MdOutlineGroup, MdGroup],
  'history': [MdOutlineHistory, MdHistory],
  'home': [MdOutlineHome, MdHome],
  'inbox': [MdOutlineInbox, MdInbox],
  'info': [MdOutlineInfo, MdInfo],
  'language': [MdOutlineLanguage, MdLanguage],
  'layers': [MdOutlineLayers, MdLayers],
  'light_mode': [MdOutlineLightMode, MdLightMode],
  'local_fire_department': [MdOutlineLocalFireDepartment, MdLocalFireDepartment],
  'local_offer': [MdOutlineLocalOffer, MdLocalOffer],
  'local_pizza': [MdOutlineLocalPizza, MdLocalPizza],
  'local_shipping': [MdOutlineLocalShipping, MdLocalShipping],
  'location_off': [MdOutlineLocationOff, MdLocationOff],
  'location_on': [MdOutlineLocationOn, MdLocationOn],
  'location_searching': [MdOutlineLocationSearching, MdLocationSearching],
  'lock': [MdOutlineLock, MdLock],
  'login': [MdOutlineLogin, MdLogin],
  'logout': [MdOutlineLogout, MdLogout],
  'mail': [MdOutlineMail, MdMail],
  'manage_accounts': [MdOutlineManageAccounts, MdManageAccounts],
  'menu': [MdOutlineMenu, MdMenu],
  'menu_book': [MdOutlineMenuBook, MdMenuBook],
  'more_vert': [MdOutlineMoreVert, MdMoreVert],
  'motion_photos_on': [MdOutlineMotionPhotosOn, MdMotionPhotosOn],
  'my_location': [MdOutlineMyLocation, MdMyLocation],
  'navigation': [MdOutlineNavigation, MdNavigation],
  'open_in_new': [MdOutlineOpenInNew, MdOpenInNew],
  'package_2': [MdOutlineInventory2, MdInventory2],
  'pause': [MdOutlinePause, MdPause],
  'payments': [MdOutlinePayments, MdPayments],
  'person': [MdOutlinePerson, MdPerson],
  'phone_in_talk': [MdOutlinePhoneInTalk, MdPhoneInTalk],
  'phone_iphone': [MdOutlinePhoneIphone, MdPhoneIphone],
  'photo_camera': [MdOutlinePhotoCamera, MdPhotoCamera],
  'play_arrow': [MdOutlinePlayArrow, MdPlayArrow],
  'play_circle': [MdOutlinePlayCircle, MdPlayCircle],
  'progress_activity': [MdOutlineAutorenew, MdAutorenew],
  'public': [MdOutlinePublic, MdPublic],
  'receipt_long': [MdOutlineReceiptLong, MdReceiptLong],
  'remove': [MdOutlineRemove, MdRemove],
  'replay': [MdOutlineReplay, MdReplay],
  'restaurant': [MdOutlineRestaurant, MdRestaurant],
  'restaurant_menu': [MdOutlineRestaurantMenu, MdRestaurantMenu],
  'save': [MdOutlineSave, MdSave],
  'schedule': [MdOutlineSchedule, MdSchedule],
  'search': [MdOutlineSearch, MdSearch],
  'search_off': [MdOutlineSearchOff, MdSearchOff],
  'sentiment_dissatisfied': [MdOutlineSentimentDissatisfied, MdSentimentDissatisfied],
  'settings': [MdOutlineSettings, MdSettings],
  'share': [MdOutlineShare, MdShare],
  'shopping_bag': [MdOutlineShoppingBag, MdShoppingBag],
  'shopping_cart': [MdOutlineShoppingCart, MdShoppingCart],
  'shopping_cart_off': [MdOutlineRemoveShoppingCart, MdRemoveShoppingCart],
  'star': [MdOutlineStar, MdStar],
  'star_half': [MdOutlineStarHalf, MdStarHalf],
  'star_rate': [MdOutlineStarRate, MdStarRate],
  'stars': [MdOutlineStars, MdStars],
  'store_off': [MdOutlineDoNotDisturbOn, MdDoNotDisturbOn],
  'storefront': [MdOutlineStorefront, MdStorefront],
  'sync': [MdOutlineSync, MdSync],
  'thumb_up': [MdOutlineThumbUp, MdThumbUp],
  'trending_down': [MdOutlineTrendingDown, MdTrendingDown],
  'trending_up': [MdOutlineTrendingUp, MdTrendingUp],
  'two_wheeler': [MdOutlineTwoWheeler, MdTwoWheeler],
  'verified_user': [MdOutlineVerifiedUser, MdVerifiedUser],
  'visibility': [MdOutlineVisibility, MdVisibility],
  'visibility_off': [MdOutlineVisibilityOff, MdVisibilityOff],
};

const Icon = ({ name, filled = false, className = '', size, title, ...rest }) => {
  const entry = ICONS[name];

  if (!entry) {
    // An unmapped name should be loud in development but must never break a
    // page in production, so reserve the space and carry on.
    if (import.meta.env.DEV) {
      console.warn('[Icon] Unknown icon name: ' + name);
    }
    return <span className={'inline-block w-[1em] h-[1em] ' + className} aria-hidden="true" />;
  }

  const Component = filled ? entry[1] : entry[0];

  return (
    <Component
      className={'inline-block shrink-0 ' + className}
      size={size}
      // Decorative by default; pass a title when the icon is the only label.
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      title={title}
      {...rest}
    />
  );
};

export const ICON_NAMES = Object.keys(ICONS);

export default Icon;
