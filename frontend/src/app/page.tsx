"use client";

import { useEffect, useState, useRef } from 'react';

interface Member {
  id: string;
  name: string;
  hasSpoken: boolean;
  color: string;
}

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Member | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/members`);
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const handleSpin = async () => {
    if (spinning) return;
    
    setSpinning(true);
    setWinner(null);
    setShowWinnerOverlay(false);

    try {
      const res = await fetch(`${backendUrl}/api/spin`, { method: 'POST' });
      const data = await res.json();
      const selectedWinner = data.winner;

      if (data.isReset) {
        setMembers(members => members.map(m => ({ ...m, hasSpoken: false })));
      }

      setWinner(selectedWinner);

      // Calculate rotation
      const winnerIndex = members.findIndex(m => m.id === selectedWinner.id);
      const sliceAngle = 360 / members.length;
      
      // We want the center of the winner's slice to be at the top (0 degrees or 270 depending on setup).
      // Let's assume slice 0 starts at 0deg. Center of slice 0 is sliceAngle / 2.
      // Top is 270deg.
      
      const extraSpins = 5 * 360; // Spin 5 times
      const targetAngle = 360 - (winnerIndex * sliceAngle) - (sliceAngle / 2);
      
      // Ensure the rotation goes forward
      const currentMod = rotation % 360;
      const targetMod = (targetAngle % 360 + 360) % 360;
      let newRotation = rotation - currentMod + extraSpins + targetMod;

      setRotation(newRotation);

      // Wait for animation to finish
      setTimeout(() => {
        setSpinning(false);
        setShowWinnerOverlay(true);
        fetchMembers(); // Update status
      }, 4000); // 4 seconds matches CSS transition

    } catch (error) {
      console.error('Failed to spin:', error);
      setSpinning(false);
    }
  };

  const handleOverlayClose = () => {
    setShowWinnerOverlay(false);
  };

  // Render slices
  const sliceAngle = 360 / Math.max(members.length, 1);
  const getSlicePath = () => {
    // Basic SVG pie slice or CSS clip-path
    // With CSS we used clip-path polygon, but setting up arbitrary angles is hard.
    // Actually, conic-gradient is much better for a wheel background!
    if (members.length === 0) return 'transparent';
    const gradientParts = members.map((m, i) => {
      const start = i * sliceAngle;
      const end = (i + 1) * sliceAngle;
      return `${m.color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${gradientParts.join(', ')})`;
  };

  return (
    <main className="container">
      <h1>Retro Roulette</h1>
      
      <div className="layout">
        <div className="wheel-container">
          <div className="pointer"></div>
          <div 
            className="wheel" 
            style={{ 
              background: getSlicePath(),
              transform: `rotate(${rotation}deg)` 
            }}
          >
            {members.map((member, i) => {
              const startAngle = i * sliceAngle;
              const textAngle = startAngle + (sliceAngle / 2);
              
              return (
                <div 
                  key={member.id}
                  className="slice-text"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${textAngle}deg) translateY(-140px)`,
                    transformOrigin: 'center center',
                    color: '#fff',
                    fontWeight: 'bold',
                    textShadow: '0 0 4px rgba(0,0,0,0.8)',
                    fontSize: '1.2rem',
                    opacity: member.hasSpoken ? 0.3 : 1,
                  }}
                >
                  {member.name}
                </div>
              );
            })}
          </div>
        </div>

        <div className="sidebar">
          <ul className="members-list">
            {members.map((member) => (
              <li 
                key={member.id} 
                className={`member-item ${member.hasSpoken ? 'spoken' : ''} ${winner?.id === member.id ? 'active' : ''}`}
              >
                <div className="member-color" style={{ backgroundColor: member.color }}></div>
                <span>{member.name}</span>
              </li>
            ))}
          </ul>

          <button 
            className="btn btn-primary" 
            onClick={handleSpin} 
            disabled={spinning || members.length === 0}
          >
            {spinning ? 'Spinning...' : 'Spin the Wheel!'}
          </button>
        </div>
      </div>

      {showWinnerOverlay && winner && (
        <div className="winner-overlay" onClick={handleOverlayClose}>
          <div className="winner-card" onClick={e => e.stopPropagation()}>
            <h2>🎉 {winner.name} 🎉</h2>
            <p>It's your turn to speak!</p>
            <button className="btn btn-primary" onClick={handleOverlayClose}>
              Awesome!
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
