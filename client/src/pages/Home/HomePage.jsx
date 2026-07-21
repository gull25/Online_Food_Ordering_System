import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar/Navbar';
import HomeFooter from './components/HomeFooter';
import HeroSection from './components/HeroSection';
import TrendingSection from './components/TrendingSection';
import HowItWorksSection from './components/HowItWorksSection';
import CuratedCollectionsSection from './components/CuratedCollectionsSection';
import FeaturedRestaurantsSection from './components/FeaturedRestaurantsSection';
import AppPromotionSection from './components/AppPromotionSection';
import useFadeInAnimation from '../../hooks/useFadeInAnimation';
import '../../assets/styles/HomePage.css';

const HomePage = () => {
  
  // Use custom hook for animations
  useFadeInAnimation();

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrendingSection />
        <HowItWorksSection />
        <CuratedCollectionsSection />
        <FeaturedRestaurantsSection />
        <AppPromotionSection />
      </main>
      <HomeFooter />
    </>
  );
};

export default HomePage;
