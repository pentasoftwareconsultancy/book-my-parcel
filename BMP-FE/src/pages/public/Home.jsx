import Aboutus from "../../components/home/Aboutus";
import FAQs from "../../components/home/FAQs";
import Hero from "../../components/home/Hero";
import HowBook from "../../components/home/HowBook";
import Whychoose from "../../components/home/Whychoose";

/* =====================================================
   HOME PAGE
===================================================== */
export default function Home() {
  return (
    <main className="bg-[#FFFDF6] overflow-hidden">
      <Hero />
      <HowBook/>
      <Whychoose/>
      <Aboutus/>
      <FAQs /> 
    </main>
  );
}
