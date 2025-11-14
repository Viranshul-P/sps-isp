import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css'; // We will add styles to your Dashboard.css

// This is the core logic for the puzzle
const usePuzzle = (solution) => {
  const [activated, setActivated] = useState(new Set());
  const [isSolved, setIsSolved] = useState(false);

  const checkSolution = (currentNodes) => {
    if (currentNodes.size !== solution.length) return false;
    for (const node of solution) {
      if (!currentNodes.has(node)) return false;
    }
    return true;
  };

  const handleClick = (id) => {
    if (isSolved) return; // Do nothing if already solved

    const newActivated = new Set(activated);
    if (newActivated.has(id)) {
      newActivated.delete(id);
    } else {
      newActivated.add(id);
    }
    setActivated(newActivated);

    if (checkSolution(newActivated)) {
      setIsSolved(true);
    }
  };

  const resetPuzzle = () => {
    setActivated(new Set());
    setIsSolved(false);
  };

  return { activated, isSolved, handleClick, resetPuzzle };
};


export default function NodePuzzler() {
  // The solution is nodes 1, 5, and 9 (the diagonal)
  const { activated, isSolved, handleClick, resetPuzzle } = usePuzzle([1, 5, 9]);
  const nodes = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // 3x3 grid

  return (
    <div className="puzzle-widget">
      <div className="puzzle-header">
        <span>// NODE_MATRIX_SIMULATION</span>
        <button onClick={resetPuzzle} className="puzzle-reset-btn">
          RESET
        </button>
      </div>
      <div className="puzzle-grid">
        {nodes.map((id) => (
          <div 
            key={id}
            className="puzzle-node-container"
            onClick={() => handleClick(id)}
          >
            <motion.div 
              className="puzzle-node"
              animate={{ 
                backgroundColor: activated.has(id) ? "#00aaff" : "#1e293b",
                boxShadow: activated.has(id) ? "0 0 15px #00aaff" : "none"
              }}
              whileHover={{ scale: 1.1 }}
            />
          </div>
        ))}
      </div>
      <AnimatePresence>
        {isSolved && (
          <motion.div 
            className="puzzle-solved-message"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            CONNECTION_ESTABLISHED
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};