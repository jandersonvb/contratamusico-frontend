import { Categories } from "./components/Categories/Categories";
import { FeaturedMusicians } from "./components/FeaturedMusicians/FeaturedMusicians";
import { Hero } from "./components/Hero/Hero";
import { Steps } from "./components/Steps/Steps";
import { Testimonials } from "./components/Testimonials/Testimonials";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Hero />
      <Categories />
      <Steps />
      <FeaturedMusicians />
      <Testimonials />
    </main>
  );
}
