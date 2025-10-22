import { motion } from 'framer-motion'
import { HeroSection } from '../components/HeroSection'
import { FeatureSection } from '../components/FeatureSection'
import { TestimonialSection } from '../components/TestimonialSection'
import { PricingSection } from '../components/PricingSection'
import { Chatbot } from '../components/Chatbot' // ✅ Import avec accolades

export function Home() {
  return (
    <div className="w-full bg-gradient-to-br from-black via-blue-900 to-indigo-900 text-white">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <HeroSection />
        <FeatureSection />
        <TestimonialSection />
        <PricingSection />
        <Chatbot />
      </motion.div>
    </div>
  )
}