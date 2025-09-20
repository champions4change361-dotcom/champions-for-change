import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ChampionsBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user came from Champions for Change domain
    const urlParams = new URLSearchParams(window.location.search);
    const fromChampions = urlParams.get('from') === 'champions';
    
    if (fromChampions) {
      setShowBanner(true);
      
      // Clean up the URL parameter without affecting browser history
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('from');
      window.history.replaceState({}, '', newUrl.toString());
      
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg relative z-50" data-testid="champions-banner">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <span className="text-lg font-bold">🏆</span>
            </div>
            <div>
              <p className="font-semibold text-lg">
                Welcome to Champions for Change
              </p>
              <p className="text-green-100 text-sm">
                Tournament management powered by Trantor
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowBanner(false)}
            className="text-white hover:text-green-200 transition-colors"
            data-testid="banner-close"
            aria-label="Close banner"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}