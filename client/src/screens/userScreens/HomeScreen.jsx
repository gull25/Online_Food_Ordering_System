import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar/Navbar';
import HomeFooter from '../../components/homeScreen/homeScreenComponents/HomeFooter';
import HeroSection from '../../components/homeScreen/homeScreenComponents/HeroSection';
import TrendingSection from '../../components/homeScreen/homeScreenComponents/TrendingSection';
import HowItWorksSection from '../../components/homeScreen/homeScreenComponents/HowItWorksSection';
import CuratedCollectionsSection from '../../components/homeScreen/homeScreenComponents/CuratedCollectionsSection';
import FeaturedRestaurantsSection from '../../components/homeScreen/homeScreenComponents/FeaturedRestaurantsSection';

import useFadeInAnimation from '../../components/hooks/useFadeInAnimation';


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

      </main>
      <HomeFooter />
    </>
  );
};

export default HomePage;
