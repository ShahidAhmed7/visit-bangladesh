import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";

const externalLinkProps = { target: "_blank", rel: "noreferrer" };

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 pt-16 text-emerald-50">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-8 border-b border-emerald-700/40 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <img src={logo} alt="Visit Bangladesh" className="h-12 w-auto" />
            <p className="text-sm leading-relaxed text-emerald-50/80">
              Discover the beauty, culture, and heritage of Bangladesh. Your trusted companion for exploring destinations,
              stories, and travel insights.
            </p>
            <div className="flex items-center gap-3 text-emerald-50">
              <a href="https://facebook.com" {...externalLinkProps} className="rounded-full border border-emerald-700 p-2 hover:bg-emerald-800">
                <FaFacebookF />
              </a>
              <a href="https://instagram.com" {...externalLinkProps} className="rounded-full border border-emerald-700 p-2 hover:bg-emerald-800">
                <FaInstagram />
              </a>
              <a href="https://youtube.com" {...externalLinkProps} className="rounded-full border border-emerald-700 p-2 hover:bg-emerald-800">
                <FaYoutube />
              </a>
              <a href="https://twitter.com" {...externalLinkProps} className="rounded-full border border-emerald-700 p-2 hover:bg-emerald-800">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com" {...externalLinkProps} className="rounded-full border border-emerald-700 p-2 hover:bg-emerald-800">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold text-white">Explore Bangladesh</h4>
            <ul className="space-y-2 text-sm text-emerald-50/80">
              <li><Link to="/spots" className="hover:text-white">Destinations</Link></li>
              <li><Link to="/blogs" className="hover:text-white">Stories / Blogs</Link></li>
              <li><Link to="/events" className="hover:text-white">Events & Festivals</Link></li>
              <li><Link to="/gallery" className="hover:text-white">Photo Gallery</Link></li>
              <li><Link to="/culture" className="hover:text-white">Cultural Attractions</Link></li>
              <li><Link to="/heritage" className="hover:text-white">Heritage Sites</Link></li>
              <li><Link to="/experiences" className="hover:text-white">Travel Experiences</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold text-white">Government & Official</h4>
            <ul className="space-y-2 text-sm text-emerald-50/80">
              <li><a href="https://tourismboard.gov.bd" {...externalLinkProps} className="hover:text-white">Bangladesh Tourism Board</a></li>
              <li><a href="https://parjatan.gov.bd" {...externalLinkProps} className="hover:text-white">Bangladesh Parjatan Corporation</a></li>
              <li><a href="https://mocat.gov.bd" {...externalLinkProps} className="hover:text-white">Ministry of Civil Aviation & Tourism</a></li>
              <li><a href="https://www.police.gov.bd/en/hot_line_number" {...externalLinkProps} className="hover:text-white">Bangladesh Police – Tourist Help Desk</a></li>
              <li><a href="https://fireservice.gov.bd" {...externalLinkProps} className="hover:text-white">Fire Service & Civil Defence</a></li>
              <li><a href="https://dip.gov.bd" {...externalLinkProps} className="hover:text-white">Immigration & Visa Information</a></li>
              <li><a href="https://rapid.ddm.gov.bd/hazard/list" {...externalLinkProps} className="hover:text-white">National Disaster Alerts</a></li>
              <li><a href="https://bmd.gov.bd" {...externalLinkProps} className="hover:text-white">Bangladesh Meteorological Department</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-bold text-white">Essential Travel Resources</h4>
            <ul className="space-y-2 text-sm text-emerald-50/80">
              <li><a href="https://railway.gov.bd" {...externalLinkProps} className="hover:text-white">Bangladesh Railway</a></li>
              <li><a href="https://bmd.gov.bd" {...externalLinkProps} className="hover:text-white">Weather Forecast</a></li>
              <li><a href="https://brta.gov.bd" {...externalLinkProps} className="hover:text-white">Public Transport Info – BRTA</a></li>
              <li><a href="https://caab.gov.bd" {...externalLinkProps} className="hover:text-white">Civil Aviation Authority</a></li>
              <li><a href="https://www.police.gov.bd/en/hot_line_number" {...externalLinkProps} className="hover:text-white">Emergency Hotline – 999</a></li>
              <li><a href="https://rapid.ddm.gov.bd/hazard/list" {...externalLinkProps} className="hover:text-white">Cyclone & Disaster Alerts</a></li>
              <li><a href="https://dghs.gov.bd" {...externalLinkProps} className="hover:text-white">Health & Safety – DGHS</a></li>
              <li><a href="https://bb.org.bd" {...externalLinkProps} className="hover:text-white">Currency & Exchange – Bangladesh Bank</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-emerald-50/80">
          <p>© 2025 Visit Bangladesh. All rights reserved.</p>
          <p>Crafted with ❤️ to promote the beauty, culture, and heritage of Bangladesh.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
