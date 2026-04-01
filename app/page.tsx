import { LpNav } from '@/components/landing/lp-nav'
import { LpHero } from '@/components/landing/lp-hero'
import { LpFeatures } from '@/components/landing/lp-features'
import { LpHowItWorks } from '@/components/landing/lp-howitworks'
import { LpVpp } from '@/components/landing/lp-vpp'
import { LpFaq } from '@/components/landing/lp-faq'
import { LpFooter } from '@/components/landing/lp-footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <LpNav />
      <LpHero />
      <LpFeatures />
      <LpHowItWorks />
      <LpVpp />
      <LpFaq />
      <LpFooter />
    </div>
  )
}
