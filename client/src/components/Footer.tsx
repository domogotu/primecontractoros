import { Link } from "wouter";
import { CONSENT_KEY } from "./ConsentBanner";

export default function Footer() {
  const handleCookiePreferences = () => {
    // Clear the stored consent so the banner re-appears
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch { /* ignore */ }
    // Force a page reload so the banner re-initialises
    window.location.reload();
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-700 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/features"><span className="hover:text-white cursor-pointer">Features</span></Link></li>
              <li><Link href="/pricing"><span className="hover:text-white cursor-pointer">Pricing</span></Link></li>
              <li><Link href="/security"><span className="hover:text-white cursor-pointer">Security</span></Link></li>
              <li><Link href="/documentation"><span className="hover:text-white cursor-pointer">Documentation</span></Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="https://reedssolutionsllc.org" target="_blank" rel="noopener noreferrer" className="hover:text-white">Reed's Solutions LLC</a></li>
              <li><Link href="/about"><span className="hover:text-white cursor-pointer">About</span></Link></li>
              <li><Link href="/contact"><span className="hover:text-white cursor-pointer">Contact</span></Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/glossary"><span className="hover:text-white cursor-pointer">Glossary</span></Link></li>
              <li><Link href="/help"><span className="hover:text-white cursor-pointer">Help Center</span></Link></li>
              <li><Link href="/support"><span className="hover:text-white cursor-pointer">Support</span></Link></li>
              <li><Link href="/platform-compliance"><span className="hover:text-white cursor-pointer">Compliance</span></Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/privacy"><span className="hover:text-white cursor-pointer">Privacy Policy</span></Link></li>
              <li><Link href="/terms"><span className="hover:text-white cursor-pointer">Terms of Service</span></Link></li>
              <li>
                <button
                  onClick={handleCookiePreferences}
                  className="text-sm text-gray-300 hover:text-white cursor-pointer text-left"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">&copy; 2026 Reed's Solutions LLC. All rights reserved.</p>
          <a href="https://reedssolutionsllc.org" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300">
            reedssolutionsllc.org
          </a>
        </div>
      </div>
    </footer>
  );
}
