import React, { useState, useEffect } from 'react';

export default function HpTracker({ socket, charId, sessionId, goBack }) {
  const [character, setCharacter] = useState(null);
  const [flash, setFlash] = useState(''); // 'damage' or 'heal'

  useEffect(() => {
    socket.emit('join_session', sessionId);

    const handleInitial = (chars) => {
      const myChar = chars.find(c => c.id === charId);
      if (myChar) setCharacter(myChar);
    };

    const handleUpdate = (updatedChar) => {
      if (updatedChar.id === charId) {
        setCharacter(prev => {
          if (prev) {
            if (updatedChar.hp.current < prev.hp.current) {
              triggerFlash('damage-flash');
            } else if (updatedChar.hp.current > prev.hp.current) {
              triggerFlash('heal-flash');
            }
          }
          return updatedChar;
        });
      }
    };

    socket.on('initial_state', handleInitial);
    socket.on('char_updated', handleUpdate);

    return () => {
      socket.off('initial_state', handleInitial);
      socket.off('char_updated', handleUpdate);
    };
  }, [socket, charId, sessionId]);

  const triggerFlash = (type) => {
    setFlash(type);
    setTimeout(() => setFlash(''), 400);
  };

  const changeHp = (amount) => {
    setCharacter(prev => {
      if (!prev) return prev;
      const newHp = Math.max(0, Math.min(prev.hp.max, prev.hp.current + amount));
      return { ...prev, hp: { ...prev.hp, current: newHp } };
    });
    triggerFlash(amount < 0 ? 'damage-flash' : 'heal-flash');
    socket.emit('update_hp', { charId, amount });
  };

  if (!character) return <div>Загрузка персонажа...</div>;

  return (
    <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <button onClick={goBack} className="btn" style={{alignSelf: 'flex-start', marginBottom: '2rem'}}>
        ← Назад
      </button>
      
      <div className={`glass-panel hp-tracker ${flash}`}>
        <div className="char-header">
          <h2>{character.name}</h2>
          <div className="char-class">КД: {character.ac} | Инициатива: {character.initiative}</div>
        </div>
        
        <div className="hp-interface">
          <button className="hp-btn damage" onClick={() => changeHp(-1)}>-</button>
          
          <div className="hp-display">
            <span className="hp-current">{character.hp.current}</span>
            <span className="hp-max">/ {character.hp.max}</span>
          </div>
          
          <button className="hp-btn heal" onClick={() => changeHp(1)}>+</button>
        </div>
        
        <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem'}}>
          <button className="btn" onClick={() => changeHp(-5)}>-5</button>
          <button className="btn" onClick={() => changeHp(5)}>+5</button>
        </div>
      </div>
    </div>
  );
}
