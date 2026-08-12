import React from 'react';
import Navbar from '../../components/globalComponents/Navbar';
import HomeFooter from '../../components/globalComponents/HomeFooter';
import HeroSection from '../../components/homeScreen/homeScreenComponents/HeroSection';
import TrendingSection from '../../components/homeScreen/homeScreenComponents/TrendingSection';
import HowItWorksSection from '../../components/homeScreen/homeScreenComponents/HowItWorksSection';
import CuratedCollectionsSection from '../../components/homeScreen/homeScreenComponents/CuratedCollectionsSection';
import FeaturedRestaurantsSection from '../../components/homeScreen/homeScreenComponents/FeaturedRestaurantsSection';
import { Reveal } from '../../components/common/Reveal';

/**
 * Home.
 *
 * Section reveals are now declared per-section via <Reveal>, replacing the old
 * `useFadeInAnimation` hook. That hook queried `.animate-section` once on mount
 * and set `opacity-0` on whatever it found — so any section that mounted later
 * or never intersected the viewport was left permanently invisible.
 *
 * The hero is deliberately not wrapped: above-the-fold content should be painted
 * immediately, not faded in after the fact.
 */
const HomePage = () => {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <Reveal>
          <TrendingSection />
        </Reveal>
        <Reveal>
          <HowItWorksSection />
        </Reveal>
        <Reveal>
          <CuratedCollectionsSection />
        </Reveal>
        <Reveal>
          <FeaturedRestaurantsSection />
        </Reveal>
      </main>
      <HomeFooter />
    </>
  );
};

export default HomePage;
