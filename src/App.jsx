import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import CharacterSheet from './CharacterSheet'
import DmPanel from './DmPanel'
import './App.css'

const serverUrl = import.meta.env.PROD ? undefined : 'http://localhost:3001';
const socket = io(serverUrl);

function App() {
  const [role, setRole] = useState(null) // 'dm' or 'player'
  const [charId, setCharId] = useState(null)
  const [characters, setCharacters] = useState([])
  const sessionId = 'room_1'

  useEffect(() => {
    socket.emit('join_session', sessionId)

    const handleInitial = (chars) => {
      setCharacters(chars)
    }

    const handleUpdate = (updatedChar) => {
      setCharacters(prev => {
        const exists = prev.find(c => c.id === updatedChar.id);
        if (exists) {
          return prev.map(c => c.id === updatedChar.id ? updatedChar : c);
        } else {
          return [...prev, updatedChar];
        }
      })
    }

    socket.on('initial_state', handleInitial)
    socket.on('char_updated', handleUpdate)

    return () => {
      socket.off('initial_state', handleInitial)
      socket.off('char_updated', handleUpdate)
    }
  }, [])

  const selectPlayer = (id) => {
    setCharId(id)
    setRole('player')
  }

  const createCharacter = () => {
    const name = prompt("Введите имя персонажа:");
    if (name) {
      socket.emit('create_character', { name, sessionId });
    }
  }

  const deleteCharacter = (id, name) => {
    if (window.confirm(`Вы уверены, что хотите НАВСЕГДА удалить персонажа "${name}"? Это действие нельзя отменить.`)) {
      socket.emit('delete_character', { id, sessionId });
    }
  }

  const goBack = () => {
    setRole(null)
    setCharId(null)
  }

  if (role === 'player') {
    return (
      <div className="app-container">
        <CharacterSheet socket={socket} charId={charId} sessionId={sessionId} goBack={goBack} />
      </div>
    )
  }

  if (role === 'dm') {
    return (
      <div className="app-container">
        <DmPanel socket={socket} sessionId={sessionId} goBack={goBack} />
      </div>
    )
  }

  return (
    <div className="app-container" style={{justifyContent: 'center'}}>
      <div className="glass-panel role-selector">
        <h1>D&D 5e Tracker</h1>
        
        <button className="btn primary" onClick={() => setRole('dm')}>
          👑 Я - Мастер Подземелий
        </button>
        
        <div style={{height: '1px', background: 'var(--panel-border)', margin: '1rem 0'}}></div>
        
        <h3 style={{margin: 0, color: 'var(--text-secondary)'}}>Игроки</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto'}}>
          {characters.length === 0 ? (
             <p style={{color: 'var(--text-secondary)'}}>Нет созданных персонажей</p>
          ) : characters.map(c => (
            <div key={c.id} style={{display: 'flex', gap: '5px'}}>
              <button className="btn" style={{flex: 1}} onClick={() => selectPlayer(c.id)}>
                {c.name} {c.class ? `(${c.class})` : ''}
              </button>
              <button 
                className="btn" 
                style={{width: '45px', padding: '0', background: 'rgba(255, 0, 0, 0.1)', color: '#d32f2f', border: '1px solid rgba(255,0,0,0.2)'}}
                onClick={() => deleteCharacter(c.id, c.name)}
                title="Удалить персонажа"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <button className="btn" style={{marginTop: '1rem', borderStyle: 'dashed'}} onClick={createCharacter}>
          + Создать персонажа
        </button>
      </div>
    </div>
  )
}

export default App
