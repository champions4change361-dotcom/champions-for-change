import millerBannerPath from "@assets/IMG_0178_1755214650992.jpeg";

export default function MillerHomepage() {
  return (
    <>
      <style>{`
        .miller-body {
          margin: 0;
          height: 100vh;
          background-color: #6a0dad;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          position: relative;
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
        .smoke:nth-child(1) {
          top: 20%;
          left: 25%;
          animation-delay: 0s;
        }
        .smoke:nth-child(2) {
          top: 40%;
          left: 65%;
          animation-delay: 3s;
        }
        .smoke:nth-child(3) {
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
        .miller-content {
          position: relative;
          text-align: center;
          z-index: 1;
        }
        .pirate {
          max-width: 100%;
          height: auto;
          width: 300px;
          transition: transform 0.3s ease, filter 0.3s ease;
        }
        .pirate:hover {
          transform: scale(1.1);
          filter: brightness(1.2);
        }
        @media (max-width: 600px) {
          .pirate { width: 200px; }
        }
      `}</style>
      
      <div className="miller-body">
        <div className="miller-content">
          <img 
            src={millerBannerPath} 
            alt="Welcome to Buc Nation" 
            className="pirate"
            data-testid="img-buc-nation-banner"
          />
        </div>
        <div className="smoke"></div>
        <div className="smoke"></div>
        <div className="smoke"></div>
      </div>
    </>
  );
}