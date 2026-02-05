import { useEffect, useState, useRef, useCallback } from "react";
import "@/App.css";

function App() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(true);
  const audioContextRef = useRef(null);
  const hasPlayedBeepRef = useRef(false);

  const playBeep = useCallback(() => {
    if (hasPlayedBeepRef.current) return;
    hasPlayedBeepRef.current = true;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  }, []);

  const resetTimer = useCallback(() => {
    setTimeLeft(60);
    setIsRunning(true);
    hasPlayedBeepRef.current = false;
  }, []);

  useEffect(() => {
    document.title = "1 Minute Timer – Free Online 60 Second Countdown";
  }, []);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft === 0) {
        playBeep();
        setIsRunning(false);
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, playBeep]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer-container">
      <h1 className="timer-title">1 Minute Timer</h1>
      <div className="timer-display">{formatTime(timeLeft)}</div>
      <button className="reset-button" onClick={resetTimer}>
        Reset
      </button>
      <div className="advertisement-box">
        <span className="advertisement-label">Advertisement</span>
      </div>
    </div>
  );
}

export default App;
