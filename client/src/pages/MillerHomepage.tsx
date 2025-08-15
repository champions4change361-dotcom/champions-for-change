import millerBannerPath from "@assets/IMG_0178_1755214650992.jpeg";

export default function MillerHomepage() {
  return (
    <>
      <style>{`
        .miller-container {
          min-height: 100vh;
          background-color: #6a0dad;
          position: relative;
          overflow: hidden;
        }
        .smoke {
          position: absolute;
          width: 120px;
          height: 120px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          filter: blur(25px);
          animation: swirl 12s infinite ease-in-out;
        }
        .smoke:nth-child(3) {
          top: 20%;
          left: 25%;
          animation-delay: 0s;
        }
        .smoke:nth-child(4) {
          top: 40%;
          left: 65%;
          animation-delay: 3s;
        }
        .smoke:nth-child(5) {
          top: 60%;
          left: 35%;
          animation-delay: 6s;
        }
        @keyframes swirl {
          0% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          25% { transform: translate(30px, -30px) scale(1.2); opacity: 0.4; }
          50% { transform: translate(60px, -60px) scale(1.5); opacity: 0.6; }
          75% { transform: translate(90px, -90px) scale(1.2); opacity: 0.4; }
          100% { transform: translate(120px, -120px) scale(1); opacity: 0.2; }
        }
        .pirate-image {
          background-color: #6a0dad;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      <div className="miller-container">
        {/* Simple Header */}
        <div className="w-full bg-black bg-opacity-20 p-4 relative z-10">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold text-white">Miller High School Athletics</h1>
            <p className="text-purple-100">Welcome to Buc Nation</p>
          </div>
        </div>
        
        {/* Pirate Banner Container - positioned below header */}
        <div className="container mx-auto px-4 pt-8 relative z-10">
          <div className="flex justify-center mb-8">
            <div className="pirate-image">
              <img 
                src={millerBannerPath} 
                alt="Welcome to Buc Nation" 
                className="max-w-sm h-auto transition-transform duration-300 hover:scale-105 hover:brightness-110"
                data-testid="img-buc-nation-banner"
              />
            </div>
          </div>
          
          {/* Login Section */}
          <div className="flex justify-center">
            <div className="bg-black bg-opacity-20 p-8 rounded-lg backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-6 text-center">Staff Login</h2>
              <button
                onClick={() => window.location.href = '/api/login?returnTo=/dashboard'}
                className="w-full px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                data-testid="button-staff-login"
              >
                Login to Miller Athletics System
              </button>
              <p className="text-purple-200 text-sm mt-4 text-center">
                Coaches and Athletic Trainers - Access your dashboard
              </p>
            </div>
          </div>
        </div>
        
        {/* Animated Smoke/Mist Elements */}
        <div className="smoke"></div>
        <div className="smoke"></div>
        <div className="smoke"></div>
      </div>
    </>
  );
}