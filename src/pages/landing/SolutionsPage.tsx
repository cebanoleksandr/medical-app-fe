import { CtaBanner } from '../../components/landing/CtaBanner'
import { Faq } from '../../components/landing/Faq'
import { Features } from '../../components/landing/Features'
import { Frameworks } from '../../components/landing/Frameworks'
import { Hero } from '../../components/landing/Hero'
import { Stats } from '../../components/landing/Stats'

const SolutionsPage = () => {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <Frameworks />
      <CtaBanner />
      <Faq />
    </>
  )
}

export default SolutionsPage;
