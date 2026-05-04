export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/" className="hover:text-white">Features</a></li>
              <li><a href="/" className="hover:text-white">Pricing</a></li>
              <li><a href="/" className="hover:text-white">Security</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="https://reedssolutionsllc.org" target="_blank" rel="noopener noreferrer" className="hover:text-white">Reed Solutions LLC</a></li>
              <li><a href="/" className="hover:text-white">About</a></li>
              <li><a href="/" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/glossary" className="hover:text-white">Glossary</a></li>
              <li><a href="/support" className="hover:text-white">Support</a></li>
              <li><a href="/" className="hover:text-white">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/" className="hover:text-white">Privacy</a></li>
              <li><a href="/" className="hover:text-white">Terms</a></li>
              <li><a href="/" className="hover:text-white">Compliance</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-8 flex justify-between items-center">
          <p className="text-sm text-gray-400">© 2026 Reed Solutions LLC. All rights reserved.</p>
          <a href="https://reedssolutionsllc.org" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300">
            reedssolutionsllc.org
          </a>
        </div>
      </div>
    </footer>
  );
}
