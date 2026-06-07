import AboutHero from "../../components/aboutus/AboutHero";
import AboutLegel from "../../components/aboutus/AboutLegel";
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
      <AboutLegel />
    </div>
  );}
