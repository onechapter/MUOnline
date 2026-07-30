import { useState, useEffect } from 'react';

export default function LoadingScreen({ message }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 5, 95));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <h1 className="loading-title">MU Online</h1>
        <div className="loading-bar">
          <div className="loading-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="loading-text">{message || 'Loading world...'}</p>
        <p className="loading-percent">{progress}%</p>
      </div>
    </div>
  );
}