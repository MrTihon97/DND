import React, { useState, useEffect } from 'react';

const STATS_MAP = {
  str: 'Силы',
  dex: 'Ловкости',
  con: 'Телосложения',
  int: 'Интеллекта',
  wis: 'Мудрости',
  cha: 'Харизмы'
};

const SKILLS_MAP = {
  acrobatics: 'Акробатика', animalHandling: 'Уход за животными', arcana: 'Магия', athletics: 'Атлетика',
  deception: 'Обман', history: 'История', insight: 'Проницательность', intimidation: 'Запугивание',
  investigation: 'Анализ', medicine: 'Медицина', nature: 'Природа', perception: 'Внимательность',
  performance: 'Выступление', persuasion: 'Убеждение', religion: 'Религия', sleightOfHand: 'Ловкость рук',
  stealth: 'Скрытность', survival: 'Выживание'
};

const CONDITIONS_MAP = {
  blinded: 'Ослеплен',
  charmed: 'Очарован',
  deafened: 'Оглохший',
  frightened: 'Испуган',
  grappled: 'Схвачен',
  incapacitated: 'Недееспособен',
  invisible: 'Невидим',
  paralyzed: 'Парализован',
  petrified: 'Окаменевший',
  poisoned: 'Отравлен',
  prone: 'Сбит с ног',
  restrained: 'Опутан',
  stunned: 'Ошеломлен',
  unconscious: 'Без сознания',
  exhaustion: 'Истощение'
};

const BUFFS_MAP = {
  bless: 'Благословение',
  bardic_inspiration: 'Вдохновение Барда',
  haste: 'Ускорение',
  heroism: 'Героизм',
  shield_of_faith: 'Щит веры',
  invisible: 'Невидимость',
  dodge: 'Уклонение',
  half_cover: 'Укрытие (1/2)',
  three_quarters_cover: 'Укрытие (3/4)'
};

const DAMAGE_TYPES = {
  slashing: 'Рубящий', piercing: 'Колющий', bludgeoning: 'Дробящий',
  poison: 'Яд', acid: 'Кислота', fire: 'Огонь', cold: 'Холод',
  lightning: 'Электричество', thunder: 'Звук', necrotic: 'Некротический',
  radiant: 'Излучение', psychic: 'Психический', force: 'Силовое поле'
};

export default function DmPanel({ socket, sessionId, goBack }) {
  const [characters, setCharacters] = useState([]);

  // Event Dashboard state
  const [eventType, setEventType] = useState('attack');
  const [eventTarget, setEventTarget] = useState('all');
  
  // Save specific
  const [eventStat, setEventStat] = useState('dex');
  const [eventDC, setEventDC] = useState(15);

  // Skill specific
  const [eventSkill, setEventSkill] = useState('perception');
  
  // Attack specific
  const [attackRoll, setAttackRoll] = useState(10);
  const [attackDamage, setAttackDamage] = useState(1);
  const [attackDamageType, setAttackDamageType] = useState('slashing');
  const [monsterName, setMonsterName] = useState('Монстр');

  // Story specific
  const [storyText, setStoryText] = useState('');

  const [eventLog, setEventLog] = useState([]);

  useEffect(() => {
    socket.emit('join_session', sessionId);

    const handleInitial = (chars) => setCharacters(chars);
    const handleUpdate = (updatedChar) => {
      setCharacters(prev => prev.map(c => c.id === updatedChar.id ? updatedChar : c));
    };

    const handleLogUpdated = (logData) => {
      setEventLog(logData);
    };

    socket.on('initial_state', handleInitial);
    socket.on('char_updated', handleUpdate);
    socket.on('log_updated', handleLogUpdated);

    return () => {
      socket.off('initial_state', handleInitial);
      socket.off('char_updated', handleUpdate);
      socket.off('log_updated', handleLogUpdated);
    };
  }, [socket, sessionId]);

  const requestSave = () => {
    const targetName = eventTarget === 'all' ? 'Все' : characters.find(c => c.id === eventTarget)?.name;
    
    socket.emit('dm_request_save', {
      id: Date.now().toString(),
      sessionId,
      stat: eventStat,
      statLabel: STATS_MAP[eventStat],
      dc: eventDC,
      targetIds: eventTarget === 'all' ? characters.map(c => c.id) : [eventTarget]
    });
    
    socket.emit('dm_log_event', {
      sessionId,
      text: `Запрошен спасбросок ${STATS_MAP[eventStat]} (СЛ ${eventDC}) -> ${targetName}`
    });
  };

  const requestSkill = () => {
    const targetName = eventTarget === 'all' ? 'Все' : characters.find(c => c.id === eventTarget)?.name;
    
    socket.emit('dm_request_skill', {
      id: Date.now().toString(),
      sessionId,
      skill: eventSkill,
      skillLabel: SKILLS_MAP[eventSkill],
      dc: eventDC,
      targetIds: eventTarget === 'all' ? characters.map(c => c.id) : [eventTarget]
    });
    
    socket.emit('dm_log_event', {
      sessionId,
      text: `Запрошена проверка: ${SKILLS_MAP[eventSkill]} (СЛ ${eventDC}) -> ${targetName}`
    });
  };

  const requestInitiative = () => {
    socket.emit('dm_request_initiative', {
      id: Date.now().toString(),
      sessionId,
      targetIds: characters.map(c => c.id)
    });
    
    socket.emit('dm_log_event', {
      sessionId,
      text: `Запрошен бросок инициативы у всех игроков`
    });
  };

  const sendAttack = () => {
    const targetName = eventTarget === 'all' ? 'Все' : characters.find(c => c.id === eventTarget)?.name;
    
    socket.emit('dm_attack_request', {
      id: Date.now().toString(),
      sessionId,
      monsterName: monsterName || 'Монстр',
      attackRoll,
      damage: attackDamage,
      damageType: attackDamageType,
      targetIds: eventTarget === 'all' ? characters.map(c => c.id) : [eventTarget]
    });

    socket.emit('dm_log_event', {
      sessionId,
      text: `Атака: ${monsterName || 'Монстр'} бьет ${targetName} (Бросок ${attackRoll}, Урон ${attackDamage} [${DAMAGE_TYPES[attackDamageType]}])`
    });
  };

  const sendStory = () => {
    if (!storyText) return;
    socket.emit('dm_story_event', { sessionId, text: storyText });
    setStoryText('');
  };

  return (
    <div style={{width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', color: 'black'}}>
      <button onClick={goBack} className="btn" style={{alignSelf: 'flex-start'}}>
        ← Назад
      </button>
      
      <h2 style={{marginTop: 0, fontFamily: 'sans-serif'}}>Панель Мастера (DM Dashboard)</h2>
      
      {/* EVENT SYSTEM DASHBOARD */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        <div className="glass-panel" style={{ flex: '1 1 400px', padding: '20px', background: 'white', border: '2px solid black' }}>
          
          <div style={{display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap'}}>
             <button onClick={() => setEventType('attack')} style={{flex: '1 1 100px', padding: '10px', fontWeight: 'bold', background: eventType === 'attack' ? 'black' : '#eee', color: eventType === 'attack' ? 'white' : 'black', border: '2px solid black', cursor: 'pointer'}}>АТАКА</button>
             <button onClick={() => setEventType('save')} style={{flex: '1 1 100px', padding: '10px', fontWeight: 'bold', background: eventType === 'save' ? 'black' : '#eee', color: eventType === 'save' ? 'white' : 'black', border: '2px solid black', cursor: 'pointer'}}>СПАСБРОСОК</button>
             <button onClick={() => setEventType('skill')} style={{flex: '1 1 100px', padding: '10px', fontWeight: 'bold', background: eventType === 'skill' ? 'black' : '#eee', color: eventType === 'skill' ? 'white' : 'black', border: '2px solid black', cursor: 'pointer'}}>НАВЫК</button>
             <button onClick={() => setEventType('initiative')} style={{flex: '1 1 100px', padding: '10px', fontWeight: 'bold', background: eventType === 'initiative' ? 'black' : '#eee', color: eventType === 'initiative' ? 'white' : 'black', border: '2px solid black', cursor: 'pointer'}}>ИНИЦИАТИВА</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {eventType !== 'initiative' && (
              <div>
                <label style={{fontWeight: 'bold', fontSize: '0.8rem'}}>ЦЕЛЬ:</label>
                <select value={eventTarget} onChange={e => setEventTarget(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}}>
                  <option value="all">Все игроки</option>
                  {characters.map(c => <option key={c.id} value={c.id}>{c.name || 'Безымянный'}</option>)}
                </select>
              </div>
            )}

            {eventType === 'save' && (
               <>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <div style={{flex: 2}}>
                      <label style={{fontWeight: 'bold', fontSize: '0.8rem'}}>ХАРАКТЕРИСТИКА:</label>
                      <select value={eventStat} onChange={e => setEventStat(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}}>
                        {Object.entries(STATS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div style={{flex: 1}}>
                      <label style={{fontWeight: 'bold', fontSize: '0.8rem'}}>СЛОЖНОСТЬ (СЛ):</label>
                      <input type="number" value={eventDC} onChange={e => setEventDC(parseInt(e.target.value) || 0)} style={{width: '100%', padding: '8px', marginTop: '5px', textAlign: 'center'}} />
                    </div>
                  </div>
                  <button onClick={requestSave} style={{padding: '10px', background: '#d32f2f', color: 'white', fontWeight: 'bold', border: '2px solid black', borderRadius: '4px', cursor: 'pointer', marginTop: '10px'}}>
                    ОТПРАВИТЬ ЗАПРОС
                  </button>
               </>
            )}

            {eventType === 'attack' && (
               <>
                  <div>
                    <label style={{fontWeight: 'bold', fontSize: '0.8rem'}}>КТО АТАКУЕТ (название монстра):</label>
                    <input type="text" value={monsterName} onChange={e => setMonsterName(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}} />
                  </div>
                  <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <div style={{flex: 1}}>
                      <label style={{fontWeight: 'bold', fontSize: '0.8rem'}}>БРОСОК АТАКИ:</label>
                      <input type="number" value={attackRoll} onChange={e => setAttackRoll(parseInt(e.target.value) || 0)} style={{width: '100%', padding: '8px', marginTop: '5px', textAlign: 'center'}} />
                    </div>
                    <div style={{flex: 1}}>
                      <label style={{fontWeight: 'bold', fontSize: '0.8rem'}}>УРОН:</label>
                      <input type="number" value={attackDamage} onChange={e => setAttackDamage(parseInt(e.target.value) || 0)} style={{width: '100%', padding: '8px', marginTop: '5px', textAlign: 'center'}} />
                    </div>
                    <div style={{flex: 1}}>
                      <label style={{fontWeight: 'bold', fontSize: '0.8rem'}}>ТИП УРОНА:</label>
                      <select value={attackDamageType} onChange={e => setAttackDamageType(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}}>
                        {Object.entries(DAMAGE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={sendAttack} style={{padding: '10px', background: '#d32f2f', color: 'white', fontWeight: 'bold', border: '2px solid black', borderRadius: '4px', cursor: 'pointer', marginTop: '10px'}}>
                    СОВЕРШИТЬ АТАКУ
                  </button>
               </>
            )}

            {eventType === 'skill' && (
               <>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <div style={{flex: 2}}>
                      <label style={{fontWeight: 'bold', fontSize: '0.8rem'}}>ПРОВЕРКА НАВЫКА:</label>
                      <select value={eventSkill} onChange={e => setEventSkill(e.target.value)} style={{width: '100%', padding: '8px', marginTop: '5px'}}>
                        {Object.entries(SKILLS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div style={{flex: 1}}>
                      <label style={{fontWeight: 'bold', fontSize: '0.8rem'}}>СЛОЖНОСТЬ (СЛ):</label>
                      <input type="number" value={eventDC} onChange={e => setEventDC(parseInt(e.target.value) || 0)} style={{width: '100%', padding: '8px', marginTop: '5px', textAlign: 'center'}} />
                    </div>
                  </div>
                  <button onClick={requestSkill} style={{padding: '10px', background: '#1976d2', color: 'white', fontWeight: 'bold', border: '2px solid black', borderRadius: '4px', cursor: 'pointer', marginTop: '10px'}}>
                    ЗАПРОСИТЬ ПРОВЕРКУ НАВЫКА
                  </button>
               </>
            )}

            {eventType === 'initiative' && (
               <>
                  <p style={{fontSize: '0.9rem', color: '#555', marginTop: '0'}}>Запросить у всех игроков бросок инициативы. Приложение автоматически прибавит их модификатор Ловкости и обновит список группы.</p>
                  <button onClick={requestInitiative} style={{padding: '10px', background: '#388e3c', color: 'white', fontWeight: 'bold', border: '2px solid black', borderRadius: '4px', cursor: 'pointer', marginTop: '10px'}}>
                    ЗАПРОСИТЬ БРОСОК У ВСЕХ
                  </button>
               </>
            )}

          </div>
        </div>
        
        {/* ОТДЫХ */}
            <div className="glass-panel" style={{ flex: '1 1 300px', padding: '20px', background: '#e3f2fd', border: '2px solid #1976d2' }}>
              <h3 style={{marginTop: 0, color: '#1565c0'}}>Отдых (Привал)</h3>
              <p style={{fontSize: '0.9rem', color: '#555', marginBottom: '15px'}}>Отдых применяется сразу ко всей группе.</p>
              
              <button 
                onClick={() => {
                  if(window.confirm('Объявить Короткий отдых? (Игроки смогут потратить Кости Хитов)')) {
                    socket.emit('dm_short_rest', sessionId);
                  }
                }}
                style={{width: '100%', padding: '10px', background: 'white', color: '#1565c0', fontWeight: 'bold', border: '2px solid #1565c0', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px'}}
              >
                ☕ КОРОТКИЙ ОТДЫХ
              </button>
              
              <button 
                onClick={() => {
                  if(window.confirm('Объявить Длительный отдых? (Восстановит всем ХП и снимет эффекты)')) {
                    socket.emit('dm_long_rest', sessionId);
                  }
                }}
                style={{width: '100%', padding: '10px', background: '#1565c0', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
              >
                🏕️ ДЛИТЕЛЬНЫЙ ОТДЫХ
              </button>
            </div>

            <div className="glass-panel" style={{ flex: '1 1 300px', padding: '20px', background: '#f9f9f9', border: '2px solid black', display: 'flex', flexDirection: 'column' }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3 style={{marginTop: 0, marginBottom: 0}}>Журнал событий</h3>
            <button onClick={() => socket.emit('clear_log', sessionId)} style={{padding: '5px 10px', background: '#fff', border: '1px solid #ccc', cursor: 'pointer', fontSize: '0.8rem'}}>Очистить</button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, borderTop: '1px solid #ccc', marginTop: '10px', paddingTop: '10px', fontSize: '0.9rem' }}>
            {eventLog.length === 0 ? <p style={{color: '#888'}}>Пока событий нет...</p> : null}
            {eventLog.map(log => (
              <div key={log.id} style={{ marginBottom: '8px', borderBottom: '1px dotted #ccc', paddingBottom: '4px' }}>
                <span style={{color: '#888', fontSize: '0.75rem', marginRight: '5px'}}>[{log.time}]</span>
                <span>{log.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <hr style={{borderTop: '2px solid black', margin: '20px 0'}} />

      {/* CHARACTER CARDS */}
      <h3 style={{marginTop: 0, fontFamily: 'sans-serif'}}>Состояние группы</h3>
      <div className="dm-panel" style={{padding: 0}}>
        {characters.map(char => {
          const hpPercent = char.hp?.max ? (char.hp.current / char.hp.max) * 100 : 0;
          const activeConditions = char.conditions ? Object.entries(char.conditions).filter(([k,v]) => v).map(([k]) => CONDITIONS_MAP[k]) : [];
          const activeBuffs = char.buffs ? Object.entries(char.buffs).filter(([k,v]) => v).map(([k]) => BUFFS_MAP[k]) : [];
          const passivePerception = char.passivePerception || 10;
          
          return (
            <div key={char.id} className="glass-panel dm-char-card" style={{background: 'white', border: '2px solid black', paddingBottom: '15px'}}>
              <div className="dm-char-header" style={{flexWrap: 'wrap', gap: '5px'}}>
                <h3 className="dm-char-name">{char.name || 'Безымянный'}</h3>
                <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                  <span className="dm-char-ac" title="Скорость (в футах)">🏃 {char.speed || 30}фт</span>
                  <span className="dm-char-ac" title="Пассивная внимательность">👁️ ПВ: {passivePerception}</span>
                  <span className="dm-char-ac">ИНЦ: {char.initiative || 0}</span>
                  <span className="dm-char-ac">КБ: {char.ac || 10}</span>
                </div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#555', marginTop: '5px'}}>
                <span>
                  ХП: {char.hp?.current || 0} 
                  {char.hp?.temp ? <span style={{color: '#1976d2', fontWeight: 'bold'}}> (+{char.hp.temp})</span> : ''} 
                  / {char.hp?.max || 0}
                </span>
                <span>{char.class || 'Без класса'} (Ур. {char.level || 1})</span>
              </div>
              
              <div className="dm-hp-bar-container" style={{margin: '10px 0'}}>
                <div 
                  className={`dm-hp-bar ${hpPercent <= 30 ? 'low' : ''}`} 
                  style={{width: `${Math.max(0, hpPercent)}%`}}
                />
              </div>

              {activeConditions.length > 0 && (
                 <div style={{marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center'}}>
                   <span style={{fontWeight: 'bold', fontSize: '0.9rem', color: '#d32f2f', textTransform: 'uppercase'}}>Дебаффы:</span>
                   {activeConditions.map((cond, i) => (
                     <span key={i} style={{
                       background: '#ffebee', 
                       color: '#c62828', 
                       padding: '4px 10px', 
                       borderRadius: '4px', 
                       border: '2px solid #c62828', 
                       fontWeight: 'bold',
                       fontSize: '0.9rem',
                       textTransform: 'uppercase'
                     }}>
                       {cond}
                     </span>
                   ))}
                 </div>
              )}

              {activeBuffs.length > 0 && (
                 <div style={{marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center'}}>
                   <span style={{fontWeight: 'bold', fontSize: '0.9rem', color: '#388e3c', textTransform: 'uppercase'}}>Баффы:</span>
                   {activeBuffs.map((buff, i) => (
                     <span key={i} style={{
                       background: '#e8f5e9', 
                       color: '#2e7d32', 
                       padding: '4px 10px', 
                       borderRadius: '4px', 
                       border: '2px solid #2e7d32', 
                       fontWeight: 'bold',
                       fontSize: '0.9rem',
                       textTransform: 'uppercase'
                     }}>
                       {buff}
                     </span>
                   ))}
                 </div>
              )}

              {char.resistances && Object.entries(char.resistances).filter(([k, v]) => v && v !== 'normal').length > 0 && (
                 <div style={{marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center'}}>
                   {Object.values(char.resistances).includes('resistance') && (
                     <span style={{fontSize: '0.85rem', color: '#555', background: '#eee', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ccc'}}>
                       🛡️ {Object.keys(char.resistances).filter(k=>char.resistances[k] === 'resistance').map(k => DAMAGE_TYPES[k]).join(', ')}
                     </span>
                   )}
                   {Object.values(char.resistances).includes('immunity') && (
                     <span style={{fontSize: '0.85rem', color: '#555', background: '#eee', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ccc'}}>
                       ✨ {Object.keys(char.resistances).filter(k=>char.resistances[k] === 'immunity').map(k => DAMAGE_TYPES[k]).join(', ')}
                     </span>
                   )}
                   {Object.values(char.resistances).includes('vulnerability') && (
                     <span style={{fontSize: '0.85rem', color: '#555', background: '#eee', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ccc'}}>
                       💥 {Object.keys(char.resistances).filter(k=>char.resistances[k] === 'vulnerability').map(k => DAMAGE_TYPES[k]).join(', ')}
                     </span>
                   )}
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
