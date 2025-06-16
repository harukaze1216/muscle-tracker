import React, { useEffect, useRef, useState } from 'react';
import { formatTime } from '../../utils/helpers';
import './RestTimer.css';

interface RestTimerProps {
  /** 初期休憩時間(秒) */
  initialTime: number;
}

const RestTimer: React.FC<RestTimerProps> = ({ initialTime }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (timeLeft === 0) {
      setTimeLeft(initialTime);
    }
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, timeLeft, initialTime]);

  return (
    <div className="rest-timer">
      <div className="time-display">{formatTime(timeLeft)}</div>
      <div className="timer-controls">
        {isRunning ? (
          <button onClick={pause} className="timer-btn">一時停止</button>
        ) : (
          <button onClick={start} className="timer-btn">
            {timeLeft === 0 ? '再スタート' : '開始'}
          </button>
        )}
        <button onClick={reset} className="timer-btn secondary">リセット</button>
      </div>
      {timeLeft === 0 && <div className="timer-complete">休憩終了！</div>}
    </div>
  );
};

export default RestTimer;
