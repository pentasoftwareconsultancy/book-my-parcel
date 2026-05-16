import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

const Confetti = ({ duration = 3000, onComplete }) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Auto-stop confetti after duration
    const timer = setTimeout(() => {
      setIsActive(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [duration, onComplete]);

  if (!isActive) return null;

  return (
    <ReactConfetti
      width={windowDimensions.width}
      height={windowDimensions.height}
      numberOfPieces={200}
      recycle={false}
      gravity={0.3}
    />
  );
};

export default Confetti;
