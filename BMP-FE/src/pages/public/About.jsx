import AboutHero from "../../components/aboutus/AboutHero";
import AboutLegal from "../../components/aboutus/AboutLegal";
import AboutJourney from "../../components/aboutus/AboutJourney";
import AboutMission from "../../components/aboutus/AboutMission";
import AboutusStory from "../../components/aboutus/AboutusStory";
export default function About() {
  return (
    <div className="overflow-hidden bg-slate-50">
      <AboutHero />
      <AboutusStory />
      <AboutMission/>
      <AboutJourney />
      <AboutLegal />
    </div>
  );}
