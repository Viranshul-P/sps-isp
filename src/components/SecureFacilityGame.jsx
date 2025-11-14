import React, { useEffect, useState } from "react";
import "./SecureFacilityGame.css";

export default function SecureFacilityGame() {
  const EMPTY = 0;
  const WALL = 1;
  const LASER = 2;
  const GOAL = 3;

  const initialMap = [
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 2, 2, 2, 1, 0, 1],
    [0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
    [0, 2, 2, 0, 1, 0, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 2, 2, 2, 0, 0, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    [1, 1, 1, 0, 1, 0, 2, 2, 2, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
    [0, 2, 2, 0, 0, 0, 1, 0, 0, 3],
  ];

  const [map] = useState(initialMap);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState("");
  const [gameWon, setGameWon] = useState(false);
  const [laserPhase, setLaserPhase] = useState(0);

  // Animate lasers
  useEffect(() => {
    const interval = setInterval(() => {
      setLaserPhase(prev => (prev + 1) % 2);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Player movement handler
  const handleMovement = (e) => {
    if (gameWon) return;
    
    const key = e.key.toLowerCase();
    let { x, y } = player;

    if (key === "arrowup" || key === "w") y--;
    if (key === "arrowdown" || key === "s") y++;
    if (key === "arrowleft" || key === "a") x--;
    if (key === "arrowright" || key === "d") x++;

    // Boundaries
    if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return;

    const tile = map[y][x];

    if (tile === WALL) return;

    if (tile === LASER) {
      setStatus("SECURITY BREACH DETECTED — Restarting…");
      setTimeout(() => {
        setPlayer({ x: 0, y: 0 });
        setStatus("");
      }, 1500);
      return;
    }

    if (tile === GOAL) {
      setStatus("CLASSIFIED FILE SECURED ✔");
      setGameWon(true);
      setPlayer({ x, y });
      return;
    }

    setPlayer({ x, y });
    setStatus("");
  };

  useEffect(() => {
    window.addEventListener("keydown", handleMovement);
    return () => window.removeEventListener("keydown", handleMovement);
  });

  const resetGame = () => {
    setPlayer({ x: 0, y: 0 });
    setStatus("");
    setGameWon(false);
  };

  return (
    <div className="secure-map-container">
      <div className="game-header">
        <h3>🔒 Secure Facility Access Map</h3>
        <p className="game-instructions">
          Use Arrow Keys or WASD to navigate. Reach the GOAL without touching lasers or walls.
        </p>
      </div>
      
      <div className="grid">
        {map.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isPlayer = player.x === colIndex && player.y === rowIndex;
            const isLaserActive = laserPhase === 0 && cell === LASER;
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell 
                  ${cell === WALL ? "wall" : ""} 
                  ${cell === LASER ? "laser" : ""} 
                  ${cell === GOAL ? "goal" : ""}
                  ${isPlayer ? "player-cell" : ""}
                  ${isLaserActive ? "laser-active" : ""}
                `}
              >
                {isPlayer && <div className="player">👤</div>}
              </div>
            );
          })
        )}
      </div>
      
      <div className="status-container">
        <p className={`status ${gameWon ? "success" : status ? "error" : ""}`}>
          {status || (gameWon ? "CLASSIFIED FILE SECURED ✔" : "Mission in progress...")}
        </p>
        {gameWon && (
          <button className="reset-btn" onClick={resetGame}>
            RESTART MISSION
          </button>
        )}
      </div>
    </div>
  );
}
