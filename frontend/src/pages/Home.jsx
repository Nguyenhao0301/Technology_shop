import Hero from "../components/Hero";
import PromoSlider from "../components/PromoSlider";
import ProductShowcase from "../components/ProductShowcase";
import CategoriesShowcase from "../components/CategoriesShowcase";
import SetupShowcase from "../components/SetupShowcase";
import FeaturedBrands from "../components/FeaturedBrands";
import Testimonials from "../components/Testimonials";
import PromoBanner from "../components/PromoBanner";
import "./Home.css";
import FlashDeals from "../components/FlashDeals";
import RecentlyViewed from "../components/RecentlyViewed";
import PersonalizedRecommendations from "../components/PersonalizedRecommendations";

function Home() {
  return (
    <div className="home-page">
      <Hero />
      <PromoSlider />
      <FlashDeals />
      <ProductShowcase />
      <RecentlyViewed />
      <PersonalizedRecommendations />
      <CategoriesShowcase />
      <SetupShowcase />
      <FeaturedBrands />
      <Testimonials />
      <PromoBanner />
    </div>
  );
}

export default Home;
