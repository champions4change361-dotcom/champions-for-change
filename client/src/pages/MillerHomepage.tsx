import millerBannerPath from "@assets/IMG_0178_1755214650992.jpeg";

export default function MillerHomepage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#6a0dad' }}>
      {/* Simple Header */}
      <div className="w-full bg-black bg-opacity-20 p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-white">Miller High School Athletics</h1>
          <p className="text-purple-100">Welcome to Buc Nation</p>
        </div>
      </div>
      
      {/* Pirate Banner Container - positioned below header */}
      <div className="container mx-auto px-4 pt-8">
        <div className="flex justify-center">
          <img 
            src={millerBannerPath} 
            alt="Welcome to Buc Nation" 
            className="max-w-sm h-auto transition-transform duration-300 hover:scale-105"
            data-testid="img-buc-nation-banner"
          />
        </div>
      </div>
    </div>
  );
}