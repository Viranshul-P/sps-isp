import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css'; // Re-uses styles

// --- Symbols for the game ---
const GLYPHS = ['Ω', 'λ', 'μ', '§', 'Φ', 'Ψ'];
// Create a shuffled deck of 12 cards (6 pairs)
const createShuffledDeck = () => {
  const deck = [...GLYPHS, ...GLYPHS];
  // Simple Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.map((glyph, index) => ({
    id: index,
    glyph: glyph,
    isFlipped: false,
    isMatched: false,
  }));
};

const SymbolMatchPuzzle = ({ onSolve, doFlash, onFlashComplete }) => {
  const [cards, setCards] = useState(createShuffledDeck());
  const [flippedCards, setFlippedCards] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [flash, setFlash] = useState(false);
  const timerRef = useRef(null);

  // This effect handles the red "flash" if the user clicks AEGIS too early
  useEffect(() => {
    if (doFlash) {
      setFlash(true);
      setTimeout(() => {
        setFlash(false);
        onFlashComplete();
      }, 500);
    }
  }, [doFlash, onFlashComplete]);

  // Main game logic
  const handleCardClick = (index) => {
    if (isChecking || isSolved || cards[index].isFlipped) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    // If two cards are flipped, check for a match
    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      const [firstIndex, secondIndex] = newFlippedCards;

      if (cards[firstIndex].glyph === cards[secondIndex].glyph) {
        // --- MATCH ---
        const matchedCards = newCards.map((card) =>
          card.id === firstIndex || card.id === secondIndex
            ? { ...card, isMatched: true }
            : card
        );
        setCards(matchedCards);
        setFlippedCards([]);
        setIsChecking(false);

        // Check for win condition
        if (matchedCards.every(card => card.isMatched)) {
          setIsSolved(true);
          onSolve(); // Tell the dashboard!
        }
      } else {
        // --- NO MATCH ---
        // Flip them back over after a delay
        timerRef.current = setTimeout(() => {
          const resetCards = newCards.map((card) =>
            card.id === firstIndex || card.id === secondIndex
              ? { ...card, isFlipped: false }
              : card
          );
          setCards(resetCards);
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className={`decryption-puzzle-widget ${flash ? 'flash-border' : ''}`}>
      <div className="puzzle-header">
        <span>// SYMBOL_MATRIX_RECALL</span>
      </div>
      
      <div className="symbol-grid">
        {cards.map((card, index) => (
          <motion.div 
            key={card.id} 
            className={`symbol-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-face card-front">?</div>
            <div className="card-face card-back">{card.glyph}</div>
          </motion.div>
        ))}
      </div>
      
      {isSolved && (
        <p className="puzzle-solved-code">[ACCESS GRANTED]</p>
      )}
    </div>
  );
};

export default SymbolMatchPuzzle;