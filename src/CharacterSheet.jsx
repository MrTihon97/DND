import React, { useState, useEffect } from 'react';
import './CharacterSheet.css';
import spellsData from './spells.json';

const STATS = [
  { key: 'str', label: 'СИЛА' },
  { key: 'dex', label: 'ЛОВКОСТЬ' },
  { key: 'con', label: 'ТЕЛОСЛОЖЕНИЕ' },
  { key: 'int', label: 'ИНТЕЛЛЕКТ' },
  { key: 'wis', label: 'МУДРОСТЬ' },
  { key: 'cha', label: 'ХАРИЗМА' }
];

const SKILLS = [
  { key: 'acrobatics', stat: 'dex', label: 'Акробатика' },
  { key: 'animalHandling', stat: 'wis', label: 'Уход за животными' },
  { key: 'arcana', stat: 'int', label: 'Магия' },
  { key: 'athletics', stat: 'str', label: 'Атлетика' },
  { key: 'deception', stat: 'cha', label: 'Обман' },
  { key: 'history', stat: 'int', label: 'История' },
  { key: 'insight', stat: 'wis', label: 'Проницательность' },
  { key: 'intimidation', stat: 'cha', label: 'Запугивание' },
  { key: 'investigation', stat: 'int', label: 'Анализ' },
  { key: 'medicine', stat: 'wis', label: 'Медицина' },
  { key: 'nature', stat: 'int', label: 'Природа' },
  { key: 'perception', stat: 'wis', label: 'Внимательность' },
  { key: 'performance', stat: 'cha', label: 'Выступление' },
  { key: 'persuasion', stat: 'cha', label: 'Убеждение' },
  { key: 'religion', stat: 'int', label: 'Религия' },
  { key: 'sleightOfHand', stat: 'dex', label: 'Ловкость рук' },
  { key: 'stealth', stat: 'dex', label: 'Скрытность' },
  { key: 'survival', stat: 'wis', label: 'Выживание' }
];

const CONDITIONS = [
  { key: 'blinded', label: 'Ослеплён (Не видит, атаки по нему с преимуществом, его атаки с помехой)' },
  { key: 'charmed', label: 'Очарован (Не может атаковать очаровавшего, соц. ограничения)' },
  { key: 'deafened', label: 'Оглох (Не слышит)' },
  { key: 'exhaustion', label: 'Истощение (Уровни истощения со своими штрафами)' },
  { key: 'frightened', label: 'Испуган (Помеха на проверки и атаки, нельзя приближаться)' },
  { key: 'grappled', label: 'Схвачен (Скорость = 0)' },
  { key: 'incapacitated', label: 'Недееспособен (Не может выполнять действия и реакции)' },
  { key: 'paralyzed', label: 'Парализован (Не может двигаться, авто-провал Спасбросков Силы/Ловкости)' },
  { key: 'petrified', label: 'Окаменел (Обездвижен, имеет сопротивления урону)' },
  { key: 'poisoned', label: 'Отравлен (Помеха на атаки и проверки характеристик)' },
  { key: 'prone', label: 'Сбит с ног (Лежит, атаки по нему вблизи с преимуществом)' },
  { key: 'restrained', label: 'Опутан (Скорость 0, помехи и преимущества по атакам)' },
  { key: 'stunned', label: 'Ошеломлён (Не может действовать, авто-провал Спасбросков Силы/Ловкости)' },
  { key: 'unconscious', label: 'Без сознания (Не действует, лежит без сознания)' }
];

const BUFFS = [
  { key: 'bless', label: 'Благословение (+1d4 к атакам и спасам)' },
  { key: 'bardic_inspiration', label: 'Вдохновение Барда (доп. кубик к броску)' },
  { key: 'haste', label: 'Ускорение (+2 КБ, доп. действие, двойная скорость)' },
  { key: 'heroism', label: 'Героизм (Иммунитет к испугу, врем. ХП каждый ход)' },
  { key: 'shield_of_faith', label: 'Щит веры (+2 КБ)' },
  { key: 'invisible', label: 'Невидим (Его атаки с преимуществом)' },
  { key: 'dodge', label: 'Уклонение (Атаки по вам с помехой)' },
  { key: 'half_cover', label: 'Укрытие на половину (+2 КБ и спас Ловк.)' },
  { key: 'three_quarters_cover', label: 'Укрытие на 3/4 (+5 КБ и спас Ловк.)' }
];

const DAMAGE_TYPES = {
  slashing: 'Рубящий', piercing: 'Колющий', bludgeoning: 'Дробящий',
  poison: 'Яд', acid: 'Кислота', fire: 'Огонь', cold: 'Холод',
  lightning: 'Электричество', thunder: 'Звук', necrotic: 'Некротический',
  radiant: 'Излучение', psychic: 'Психический', force: 'Силовое поле'
};

const FULL_CASTER_SLOTS = {
  1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
};

export default function CharacterSheet({ socket, charId, sessionId, goBack }) {
  const [character, setCharacter] = useState(null);
  
  // Event System State
  const [activeRequest, setActiveRequest] = useState(null);
  const [activeSkillRequest, setActiveSkillRequest] = useState(null);
  const [activeAttackRequest, setActiveAttackRequest] = useState(null);
  const [activeInitiativeRequest, setActiveInitiativeRequest] = useState(null);
  const [rollInput, setRollInput] = useState('');
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('character');
  const [spellSearch, setSpellSearch] = useState('');
  const [spellClassFilter, setSpellClassFilter] = useState('Все классы');
  const [spellLevelFilter, setSpellLevelFilter] = useState('Все уровни');
  const [expandedSpellPreview, setExpandedSpellPreview] = useState(null);

  useEffect(() => {
    socket.emit('join_session', sessionId);

    const handleInitial = (chars) => {
      const myChar = chars.find(c => c.id === charId);
      if (myChar) setCharacter(myChar);
    };

    const handleUpdate = (updatedChar) => {
      if (updatedChar.id === charId) {
        setCharacter(updatedChar);
      }
    };

    const handleSaveRequest = (req) => {
      if (req.targetIds.includes(charId)) {
        setActiveRequest(req);
        setRollInput('');
      }
    };

    const handleAttackRequest = (req) => {
      if (req.targetIds.includes(charId)) {
        setActiveAttackRequest(req);
      }
    };

    const handleSkillRequest = (req) => {
      if (req.targetIds.includes(charId)) {
        setActiveSkillRequest(req);
        setRollInput('');
      }
    };

    const handleInitiativeRequest = (req) => {
      if (req.targetIds.includes(charId)) {
        setActiveInitiativeRequest(req);
        setRollInput('');
      }
    };

    socket.on('initial_state', handleInitial);
    socket.on('char_updated', handleUpdate);
    socket.on('player_save_request', handleSaveRequest);
    socket.on('player_attack_request', handleAttackRequest);
    socket.on('player_skill_request', handleSkillRequest);
    socket.on('player_initiative_request', handleInitiativeRequest);

    return () => {
      socket.off('initial_state', handleInitial);
      socket.off('char_updated', handleUpdate);
      socket.off('player_save_request', handleSaveRequest);
      socket.off('player_attack_request', handleAttackRequest);
      socket.off('player_skill_request', handleSkillRequest);
      socket.off('player_initiative_request', handleInitiativeRequest);
    };
  }, [socket, charId, sessionId]);

  const updateField = (field, value) => {
    const newChar = { ...character, [field]: value };
    setCharacter(newChar);
    socket.emit('update_character', newChar);
  };

  const updateNestedField = (parent, field, value) => {
    const newChar = { 
      ...character, 
      [parent]: { ...(character[parent] || {}), [field]: value } 
    };
    setCharacter(newChar);
    socket.emit('update_character', newChar);
  };

  const rollSave = (statKey) => {
    const bonus = getSaveBonus(statKey);
    const statLabel = STATS.find(s => s.key === statKey)?.label || statKey;
    socket.emit('dm_log_event', { sessionId, text: `🎲 ${character.name} кидает спасбросок ${statLabel}: бонус ${formatBonus(bonus)}` });
  };

  const rollSkill = (skillKey) => {
    const skill = SKILLS.find(s => s.key === skillKey);
    const bonus = getSkillBonus(skillKey, skill?.stat || 'wis');
    socket.emit('dm_log_event', { sessionId, text: `🎲 ${character.name} кидает ${skill?.label || skillKey}: бонус ${formatBonus(bonus)}` });
  };

  const handleAvatarClick = () => {
    const url = prompt("Введите ссылку на изображение (URL):", character.avatarUrl || "");
    if (url !== null) {
      updateField('avatarUrl', url);
    }
  };

  const calculateMod = (score) => Math.floor((score - 10) / 2);

  const formatBonus = (bonus) => (bonus >= 0 ? `+${bonus}` : bonus);
  const currentProfBonus = character?.level ? Math.ceil(1 + (character.level / 4)) : 2;

  const getSaveBonus = (statKey) => {
    const statTotal = getCalculatedStat(statKey).total;
    const mod = calculateMod(statTotal);
    const saved = character?.saves?.[statKey];
    const profLevel = typeof saved === 'boolean' ? (saved ? 1 : 0) : (saved?.proficient || 0);
    return mod + (profLevel * currentProfBonus);
  };

  const getSkillBonus = (skillKey, statKey) => {
    const statTotal = getCalculatedStat(statKey).total;
    const mod = calculateMod(statTotal);
    const saved = character?.skills?.[skillKey];
    const profLevel = typeof saved === 'boolean' ? (saved ? 1 : 0) : (saved?.proficient || 0);
    return mod + (profLevel * currentProfBonus);
  };

  // --- RULES ENGINE ---
  const getCalculatedStat = (statKey) => {
     let base = character.stats?.[statKey] || 10;
     let bonus = 0;
     if (character.inventory) {
        character.inventory.forEach(item => {
           if (item.equipped && item.statBonus === statKey) {
              bonus += (item.statValue || 0);
           }
        });
     }
     return { base, bonus, total: base + bonus };
  };

  const getCalculatedAC = () => {
     let baseAc = 10 + calculateMod(getCalculatedStat('dex').total); // Базово: 10 + Мод. Ловкости
     let hasArmor = false;
     let shieldBonus = 0;
     let magicBonus = 0;
     let manualOverride = character.ac || 0; // На случай если игрок хочет вписать руками как раньше

     if (character.inventory) {
        const armors = character.inventory.filter(i => i.equipped && i.type === 'armor');
        if (armors.length > 0) {
           baseAc = Math.max(...armors.map(a => a.ac || 0)); // Берем лучшую броню
        }

        character.inventory.forEach(item => {
           if (item.equipped) {
              if (item.type === 'shield') shieldBonus += (item.ac || 0);
              if (item.type === 'magic' && item.ac > 0) magicBonus += (item.ac || 0);
           }
        });
     }

     const total = baseAc + shieldBonus + magicBonus;
     
     return { 
       base: baseAc, 
       shield: shieldBonus, 
       magic: magicBonus, 
       total: total 
     };
  };

  const submitRoll = () => {
    if (!activeRequest || !rollInput) return;
    
    const roll = parseInt(rollInput, 10) || 0;
    
    // Calculate total: Dice Roll + Stat Modifier + Proficiency (if proficient in save)
    const baseStat = character.stats?.[activeRequest.stat] || 10;
    let bonus = calculateMod(baseStat);
    
    // Add proficiency bonus if checked
    if (character.saves?.[activeRequest.stat]) {
       bonus += (character.proficiencyBonus || 2);
    }
    
    const total = roll + bonus;
    const isSuccess = total >= activeRequest.dc;

    socket.emit('player_save_response', {
      requestId: activeRequest.id,
      sessionId,
      charId,
      charName: character.name || 'Безымянный',
      statLabel: activeRequest.statLabel,
      dc: activeRequest.dc,
      roll,
      total,
      isSuccess
    });

    setActiveRequest(null); // Close modal
  };

  const handleAttackResult = () => {
    if (!activeAttackRequest) return;
    
    const currentAC = getCalculatedAC().total;
    const isHit = activeAttackRequest.attackRoll >= currentAC;
    
    let finalDamage = activeAttackRequest.damage;
    const resType = character.resistances?.[activeAttackRequest.damageType];
    if (resType === 'immunity') finalDamage = 0;
    else if (resType === 'resistance') finalDamage = Math.floor(finalDamage / 2);
    else if (resType === 'vulnerability') finalDamage = finalDamage * 2;

    if (isHit && finalDamage > 0) {
       let remainingDamage = finalDamage;
       const currentTemp = character.hp?.temp || 0;
       let newTemp = currentTemp;
       let newHp = character.hp?.current || 0;

       if (currentTemp > 0) {
         if (currentTemp >= remainingDamage) {
           newTemp = currentTemp - remainingDamage;
           remainingDamage = 0;
         } else {
           remainingDamage -= currentTemp;
           newTemp = 0;
         }
       }

       if (remainingDamage > 0) {
         newHp = Math.max(0, newHp - remainingDamage);
       }

       const newHpObj = { ...character.hp, current: newHp, temp: newTemp };
       updateField('hp', newHpObj);
    }

    socket.emit('player_attack_response', {
      requestId: activeAttackRequest.id,
      sessionId,
      charId,
      charName: character.name || 'Безымянный',
      monsterName: activeAttackRequest.monsterName,
      attackRoll: activeAttackRequest.attackRoll,
      damage: finalDamage,
      ac: currentAC,
      isHit
    });

    setActiveAttackRequest(null);
  };

  const submitSkillRoll = () => {
    if (!activeSkillRequest || !rollInput) return;
    
    const roll = parseInt(rollInput, 10);
    const skillObj = SKILLS.find(s => s.key === activeSkillRequest.skill);
    const statMod = calculateMod(getCalculatedStat(skillObj?.stat || 'wis').total);
    const profMod = character.skills?.[activeSkillRequest.skill] ? (character.proficiencyBonus || 2) : 0;
    const extraMod = parseInt(character.skillsMod?.[activeSkillRequest.skill] || 0);

    const total = roll + statMod + profMod + extraMod;
    const isSuccess = total >= activeSkillRequest.dc;

    // Reuse player_save_response so it formats nicely in DM log
    socket.emit('player_save_response', {
      requestId: activeSkillRequest.id,
      sessionId,
      charId,
      charName: character.name || 'Безымянный',
      statLabel: activeSkillRequest.skillLabel,
      dc: activeSkillRequest.dc,
      roll,
      total,
      isSuccess
    });

    setActiveSkillRequest(null);
  };

  const submitInitiativeRoll = () => {
    if (!activeInitiativeRequest || !rollInput) return;
    
    const roll = parseInt(rollInput, 10);
    const dexMod = calculateMod(getCalculatedStat('dex').total);
    const total = roll + dexMod;

    updateField('initiative', total); // Automatically updates db and informs DM

    socket.emit('player_save_response', {
      requestId: activeInitiativeRequest.id,
      sessionId,
      charId,
      charName: character.name || 'Безымянный',
      customText: `Бросок Инициативы: ${total} (Кубик: ${roll} + ЛОВ: ${dexMod})`
    });

    setActiveInitiativeRequest(null);
  };

  if (!character) return <div>Загрузка...</div>;

  return (
    <>
      {/* DM ATTACK MODAL */}
      {activeAttackRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '4px solid black', textAlign: 'center' }}>
            <h2 style={{marginTop: 0, color: '#d32f2f'}}>ВАС АТАКУЮТ!</h2>
            <p style={{fontSize: '1.2rem'}}>Монстр <b>{activeAttackRequest.monsterName}</b> совершает бросок атаки: <b>{activeAttackRequest.attackRoll}</b></p>
            
            <div style={{ margin: '20px 0', padding: '15px', background: '#f4f4f4', borderRadius: '8px', border: '1px solid #ccc' }}>
               <p style={{margin: '0 0 10px 0', fontSize: '1.2rem'}}>Ваш Класс Брони (КБ): <b>{getCalculatedAC().total}</b></p>
               
               {(() => {
                 const isHit = activeAttackRequest.attackRoll >= getCalculatedAC().total;
                 let finalDamage = activeAttackRequest.damage;
                 let dmgModifierText = '';
                 
                 const resType = character.resistances?.[activeAttackRequest.damageType];
                 if (resType === 'immunity') {
                   finalDamage = 0;
                   dmgModifierText = ' (Иммунитет: урон 0)';
                 } else if (resType === 'resistance') {
                   finalDamage = Math.floor(finalDamage / 2);
                   dmgModifierText = ' (Сопротивление: урон / 2)';
                 } else if (resType === 'vulnerability') {
                   finalDamage = finalDamage * 2;
                   dmgModifierText = ' (Уязвимость: урон x 2)';
                 }

                 if (isHit) {
                   return (
                     <div style={{color: 'red', fontWeight: 'bold', fontSize: '1.5rem'}}>
                       ПРОБИТИЕ!
                       <div style={{fontSize: '1rem', color: 'black', marginTop: '5px'}}>
                         Вы получаете {finalDamage} урона ({DAMAGE_TYPES[activeAttackRequest.damageType] || 'Рубящий'})
                         {dmgModifierText && <span style={{display: 'block', color: '#d32f2f', fontSize: '0.9rem', marginTop: '5px'}}>{dmgModifierText}</span>}
                       </div>
                     </div>
                   );
                 } else {
                   return (
                     <div style={{color: 'green', fontWeight: 'bold', fontSize: '1.5rem'}}>
                       ПРОМАХ!
                       <div style={{fontSize: '1rem', color: 'black', marginTop: '5px'}}>Броня или уворот спасли вас</div>
                     </div>
                   );
                 }
               })()}
            </div>

            <button onClick={handleAttackResult} style={{ width: '100%', padding: '15px', background: 'black', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              {(() => {
                 const isHit = activeAttackRequest.attackRoll >= getCalculatedAC().total;
                 let finalDamage = activeAttackRequest.damage;
                 const resType = character.resistances?.[activeAttackRequest.damageType];
                 if (resType === 'immunity') finalDamage = 0;
                 else if (resType === 'resistance') finalDamage = Math.floor(finalDamage / 2);
                 else if (resType === 'vulnerability') finalDamage = finalDamage * 2;
                 
                 return isHit ? `ПОЛУЧИТЬ ${finalDamage} УРОНА` : 'ОТБИТЬ АТАКУ';
              })()}
            </button>
          </div>
        </div>
      )}

      {/* DM EVENT MODAL */}
      {activeRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '4px solid black', textAlign: 'center' }}>
            <h2 style={{marginTop: 0, color: '#d32f2f'}}>ЗАПРОС ОТ МАСТЕРА</h2>
            <p style={{fontSize: '1.2rem'}}>Сделайте спасбросок: <b>{activeRequest.statLabel}</b></p>
            <p style={{fontSize: '1.2rem'}}>Сложность (СЛ): <b>{activeRequest.dc}</b></p>
            
            {character.conditions && Object.values(character.conditions).some(v => v) && (
              <div style={{background: '#ffebee', padding: '10px', borderRadius: '8px', color: '#c62828', fontWeight: 'bold', fontSize: '0.9rem'}}>
                ⚠️ У вас есть активные негативные состояния! Возможно, этот бросок нужно делать с ПОМЕХОЙ (кинуть 2 кубика и выбрать худший). Проверьте вкладку "Ещё".
              </div>
            )}

            <div style={{ margin: '20px 0', padding: '15px', background: '#f4f4f4', borderRadius: '8px', border: '1px solid #ccc' }}>
               <p style={{margin: '0 0 10px 0', fontSize: '0.9rem'}}>Бросьте D20 и введите результат с кубика:</p>
               <input 
                 type="number" 
                 value={rollInput} 
                 onChange={e => setRollInput(e.target.value)} 
                 autoFocus
                 style={{ width: '100px', fontSize: '2rem', textAlign: 'center', border: '2px solid black', padding: '10px', borderRadius: '8px' }} 
               />
               <p style={{margin: '10px 0 0 0', fontSize: '0.8rem', color: '#555'}}>Мы автоматически добавим ваши бонусы.</p>
            </div>

            <button onClick={submitRoll} style={{ width: '100%', padding: '15px', background: 'black', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              ОТПРАВИТЬ РЕЗУЛЬТАТ
            </button>
          </div>
        </div>
      )}

      {/* DM SKILL REQUEST MODAL */}
      {activeSkillRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '4px solid #1976d2', textAlign: 'center' }}>
            <h2 style={{marginTop: 0, color: '#1976d2'}}>ПРОВЕРКА НАВЫКА</h2>
            <p style={{fontSize: '1.2rem'}}>Мастер запрашивает: <b>{activeSkillRequest.skillLabel}</b></p>
            <p style={{fontSize: '1.2rem'}}>Сложность (СЛ): <b>{activeSkillRequest.dc}</b></p>
            
            {character.conditions && Object.values(character.conditions).some(v => v) && (
              <div style={{background: '#ffebee', padding: '10px', borderRadius: '8px', color: '#c62828', fontWeight: 'bold', fontSize: '0.9rem'}}>
                ⚠️ У вас есть активные негативные состояния! Возможно, этот бросок нужно делать с ПОМЕХОЙ (кинуть 2 кубика и выбрать худший). Проверьте вкладку "Ещё".
              </div>
            )}

            <div style={{ margin: '20px 0', padding: '15px', background: '#f4f4f4', borderRadius: '8px', border: '1px solid #ccc' }}>
               <p style={{margin: '0 0 10px 0', fontSize: '0.9rem'}}>Бросьте D20 и введите результат с кубика:</p>
               <input 
                 type="number" 
                 value={rollInput} 
                 onChange={e => setRollInput(e.target.value)} 
                 autoFocus
                 style={{ width: '100px', fontSize: '2rem', textAlign: 'center', border: '2px solid #1976d2', padding: '10px', borderRadius: '8px' }} 
               />
               <p style={{margin: '10px 0 0 0', fontSize: '0.8rem', color: '#555'}}>Мы добавим бонус вашей {activeSkillRequest.skillLabel}.</p>
            </div>

            <button onClick={submitSkillRoll} style={{ width: '100%', padding: '15px', background: '#1976d2', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              ОТПРАВИТЬ РЕЗУЛЬТАТ
            </button>
          </div>
        </div>
      )}

      {/* DM INITIATIVE REQUEST MODAL */}
      {activeInitiativeRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '4px solid #388e3c', textAlign: 'center' }}>
            <h2 style={{marginTop: 0, color: '#388e3c'}}>ИНИЦИАТИВА!</h2>
            <p style={{fontSize: '1.2rem'}}>Мастер запрашивает бросок инициативы перед боем.</p>
            
            <div style={{ margin: '20px 0', padding: '15px', background: '#f4f4f4', borderRadius: '8px', border: '1px solid #ccc' }}>
               <p style={{margin: '0 0 10px 0', fontSize: '0.9rem'}}>Бросьте D20 и введите результат с кубика:</p>
               <input 
                 type="number" 
                 value={rollInput} 
                 onChange={e => setRollInput(e.target.value)} 
                 autoFocus
                 style={{ width: '100px', fontSize: '2rem', textAlign: 'center', border: '2px solid #388e3c', padding: '10px', borderRadius: '8px' }} 
               />
               <p style={{margin: '10px 0 0 0', fontSize: '0.8rem', color: '#555'}}>Мы добавим ваш бонус Ловкости ({calculateMod(getCalculatedStat('dex').total)}).</p>
            </div>

            <button onClick={submitInitiativeRoll} style={{ width: '100%', padding: '15px', background: '#388e3c', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              ЗАДАТЬ ИНИЦИАТИВУ
            </button>
          </div>
        </div>
      )}

      <div className="character-sheet" style={{paddingTop: '10px'}}>
        <button onClick={goBack} style={{width: '100%', padding: '12px', background: 'white', border: '2px dashed black', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', color: '#555'}}>
          ← СМЕНИТЬ ПЕРСОНАЖА
        </button>
      
      {/* --- CHARACTER TAB --- */}
      {activeTab === 'character' && (
      <div className="cs-tab-content">
      {/* HEADER */}
      <div className="cs-header">
        <div className="cs-avatar-box" onClick={handleAvatarClick} title="Нажмите, чтобы добавить фото">
          {character.avatarUrl ? (
            <img src={character.avatarUrl} alt="Avatar" />
          ) : (
            <div className="cs-avatar-placeholder">+ ФОТО</div>
          )}
        </div>

        <div className="cs-name-box">
          <input 
            type="text" 
            value={character.name || ''} 
            onChange={e => updateField('name', e.target.value)} 
            className="cs-h1-input"
          />
          <span className="cs-name-label">ИМЯ ПЕРСОНАЖА</span>
        </div>
        
        <div className="cs-info-grid">
          <div style={{display: 'flex', gap: '10px'}}>
            <div className="cs-info-item" style={{flex: 2}}>
              <input type="text" value={character.class || ''} onChange={e => updateField('class', e.target.value)} />
              <label>КЛАСС</label>
            </div>
            <div className="cs-info-item" style={{flex: 1}}>
              <input type="number" value={character.level || 1} onChange={e => updateField('level', parseInt(e.target.value) || 1)} />
              <label>УРОВЕНЬ</label>
            </div>
          </div>
          <div className="cs-info-item">
            <input type="text" value={character.background || ''} onChange={e => updateField('background', e.target.value)} />
            <label>ИСТОРИЯ ПЕРСОНАЖА</label>
          </div>
          <div className="cs-info-item">
            <input type="text" value={character.playerName || ''} onChange={e => updateField('playerName', e.target.value)} />
            <label>ИМЯ ИГРОКА</label>
          </div>
          <div className="cs-info-item">
            <input type="text" value={character.race || ''} onChange={e => updateField('race', e.target.value)} />
            <label>РАСА</label>
          </div>
          <div className="cs-info-item">
            <input type="text" value={character.alignment || ''} onChange={e => updateField('alignment', e.target.value)} />
            <label>ХАРАКТЕР</label>
          </div>
          <div className="cs-info-item">
            <input type="text" value={character.xp || ''} onChange={e => updateField('xp', e.target.value)} />
            <label>ОПЫТ (XP)</label>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="cs-body">
        
        {/* LEFT COLUMN */}
        <div className="cs-col-left">
          
          <div style={{display: 'flex', gap: '15px'}}>
            {/* STATS COLUMN */}
            <div className="cs-stats-container">
              {STATS.map(stat => {
                const statObj = getCalculatedStat(stat.key);
                const score = statObj.total;
                const mod = calculateMod(score);
                return (
                  <div key={stat.key} className="cs-stat-box" title={statObj.bonus ? `База: ${statObj.base} | Бонус: +${statObj.bonus}` : 'Базовое значение'}>
                    <label>{stat.label}</label>
                    <div className="cs-stat-mod">
                      {mod > 0 ? '+' : ''}{mod}
                    </div>
                    <div className="cs-stat-box-inner">
                      <input 
                        type="number" 
                        value={character.stats?.[stat.key] || 10} 
                        onChange={e => updateNestedField('stats', stat.key, parseInt(e.target.value) || 0)}
                        className="cs-stat-input"
                      />
                    </div>
                    {statObj.bonus !== 0 && (
                      <div style={{fontSize: '0.65rem', color: '#0055aa', marginTop: '-15px', fontWeight: 'bold', zIndex: 10}}>
                        {statObj.bonus > 0 ? '+' : ''}{statObj.bonus} от вещей
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SKILLS & SAVES */}
            <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '15px'}}>
              
              <div className="cs-small-box" title="Бонус, который можно потратить для получения преимущества.">
                <input type="number" value={character.inspiration || 0} onChange={e => updateField('inspiration', parseInt(e.target.value))} />
                <label>ВДОХНОВЕНИЕ</label>
              </div>
              
              <div className="dnd-box cs-prof-box" title="Автоматически увеличивается на высоких уровнях. Прибавляется к броскам, в которых вы мастер." style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <div style={{border: '1px solid #ccc', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '40px', textAlign: 'center'}}>
                  +{currentProfBonus}
                </div>
                <label style={{margin: 0}}>БОНУС МАСТЕРСТВА</label>
              </div>

              <div className="dnd-box cs-list-box">
                {STATS.map(stat => {
                  const saved = character.saves?.[stat.key];
                  const isProf = typeof saved === 'boolean' ? (saved ? 1 : 0) : (saved?.proficient || 0);
                  return (
                   <div key={stat.key} className="cs-list-item">
                     <button 
                       onClick={() => updateNestedField('saves', stat.key, { proficient: (isProf + 1) % 2 })}
                       style={{width: '20px', height: '20px', padding: 0, background: 'white', border: '1px solid #aaa', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'}}
                     >
                       {isProf ? '✔' : ''}
                     </button>
                     <span style={{width: '25px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', borderBottom: '1px solid #ccc', cursor: 'pointer', display: 'inline-block'}} onClick={() => rollSave(stat.key)}>
                       {formatBonus(getSaveBonus(stat.key))}
                     </span>
                     <label onClick={() => rollSave(stat.key)}>{stat.label}</label>
                   </div>
                  );
                })}
                <span className="dnd-box-title">СПАСБРОСКИ</span>
              </div>

              <div className="dnd-box cs-list-box" style={{flex: 1}}>
                <p style={{fontSize: '0.65rem', color: '#888', margin: '0 0 5px 0', textAlign: 'center'}}>Дважды ✔ для Экспертизы (★)</p>
                {SKILLS.map(skill => {
                  const saved = character.skills?.[skill.key];
                  const isProf = typeof saved === 'boolean' ? (saved ? 1 : 0) : (saved?.proficient || 0);
                  return (
                   <div key={skill.key} className="cs-list-item">
                     <button 
                       onClick={() => updateNestedField('skills', skill.key, { proficient: (isProf + 1) % 3 })}
                       style={{width: '20px', height: '20px', padding: 0, background: 'white', border: '1px solid #aaa', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: isProf === 2 ? '#d32f2f' : 'black'}}
                     >
                       {isProf === 1 ? '✔' : isProf === 2 ? '★' : ''}
                     </button>
                     <span style={{width: '25px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', borderBottom: '1px solid #ccc', cursor: 'pointer', display: 'inline-block'}} onClick={() => rollSkill(skill.key)}>
                       {formatBonus(getSkillBonus(skill.key, skill.stat))}
                     </span>
                     <label onClick={() => rollSkill(skill.key)}>{skill.label} <span>({skill.stat})</span></label>
                   </div>
                  );
                })}
                <span className="dnd-box-title">НАВЫКИ</span>
              </div>

            </div>
          </div>
          
          <div className="cs-small-box" style={{marginTop: '15px'}}>
            <input type="number" value={character.passivePerception || 10} onChange={e => updateField('passivePerception', parseInt(e.target.value))} />
            <label>ПАССИВНАЯ ВНИМАТЕЛЬНОСТЬ</label>
          </div>

          <div className="dnd-box cs-textarea-box" style={{minHeight: '200px'}}>
             <textarea value={character.proficiencies || ''} onChange={e => updateField('proficiencies', e.target.value)}></textarea>
             <span className="dnd-box-title">ВЛАДЕНИЯ И ЯЗЫКИ</span>
          </div>

        </div>

        {/* MIDDLE COLUMN */}
        <div className="cs-col-mid">
          <div className="cs-combat-stats">
            <div className="cs-combat-box" title={`Класс Брони (Armor Class) — ваша защита от атак. База: ${getCalculatedAC().base} | Щит: +${getCalculatedAC().shield} | Магия: +${getCalculatedAC().magic}`}>
              <div style={{fontSize: '2rem', fontWeight: 'bold', margin: '10px 0'}}>
                 {getCalculatedAC().total}
              </div>
              <label style={{cursor: 'help', borderBottom: '1px dotted #ccc'}}>ЗАЩИТА (КБ)</label>
            </div>
            <div className="cs-combat-box">
              <input type="number" value={character.initiative || 0} onChange={e => updateField('initiative', parseInt(e.target.value) || 0)} />
              <label>ИНИЦИАТИВА</label>
            </div>
            <div className="cs-combat-box">
              <input type="number" value={character.speed || 30} onChange={e => updateField('speed', parseInt(e.target.value) || 0)} />
              <label>СКОРОСТЬ</label>
            </div>
          </div>

          <div className="dnd-box cs-hp-box">
            <div className="cs-hp-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span>❤️ Максимальное здоровье</span>
                <input type="number" value={character.hp?.max || 0} onChange={e => updateNestedField('hp', 'max', parseInt(e.target.value) || 0)} style={{width: '60px'}} />
              </div>
            </div>
            <div className="cs-hp-current-container">
              <button className="hp-btn dmg" onClick={() => updateNestedField('hp', 'current', Math.max(0, (character.hp?.current || 0) - 1))}>-</button>
              <div className="cs-hp-current">
                {character.hp?.current || 0} / {character.hp?.max || 0}
                <div style={{fontSize: '0.9rem', color: '#666', marginTop: '5px'}}>❤️ Здоровье</div>
              </div>
              <button className="hp-btn heal" onClick={() => updateNestedField('hp', 'current', Math.min(character.hp?.max || 0, (character.hp?.current || 0) + 1))}>+</button>
            </div>
            <div className="cs-hp-temp">
              <input type="number" value={character.hp?.temp || 0} onChange={e => updateNestedField('hp', 'temp', parseInt(e.target.value) || 0)} />
              <span>🛡 Дополнительное здоровье</span>
            </div>
          </div>

          <div className="dnd-box cs-hit-dice-box" title="Бросьте эти кости во время короткого отдыха, чтобы вылечиться. Максимум равен вашему уровню.">
            <div style={{display: 'flex', marginBottom: '5px', alignItems: 'center', gap: '5px'}}>
              <span style={{fontSize: '0.75rem', color: '#666', whiteSpace: 'nowrap'}}>Тип:</span>
              <select value={character.hitDice?.type || ''} onChange={e => updateNestedField('hitDice', 'type', e.target.value)} style={{flex: 1, padding: '2px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.75rem'}}>
                <option value="">Выберите...</option>
                <option value="d6">d6 (Маг, Чародей)</option>
                <option value="d8">d8 (Плут, Жрец, Бард)</option>
                <option value="d10">d10 (Воин, Паладин)</option>
                <option value="d12">d12 (Варвар)</option>
              </select>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center'}}>
              <span style={{fontSize: '0.8rem', color: '#666'}}>Максимум:</span>
              <span style={{fontSize: '1rem', fontWeight: 'bold'}}>{character.level || 1}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: '0.8rem', color: '#666'}}>Осталось:</span>
              <div className="cs-ds-circles" style={{display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end', flex: 1}}>
                {Array.from({length: Math.min(20, character.level || 1)}).map((_, n) => {
                  const current = character.hitDice?.current ?? character.level ?? 1;
                  return (
                    <input 
                      key={`hd-${n}`} 
                      type="checkbox" 
                      checked={current > n} 
                      onChange={e => updateNestedField('hitDice', 'current', e.target.checked ? n + 1 : n)} 
                      style={{width: '18px', height: '18px', cursor: 'pointer'}} 
                    />
                  );
                })}
              </div>
            </div>
            <div style={{textAlign: 'center', marginTop: '10px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#333'}}>Кости здоровья (Отдых)</div>
          </div>

          <div className="dnd-box cs-rest-box" style={{marginBottom: '20px'}}>
             <span className="dnd-box-title">ОТДЫХ</span>
             <div style={{display: 'flex', gap: '10px', padding: '15px 10px 10px 10px'}}>
               <button 
                 onClick={() => socket.emit('player_short_rest', { sessionId, charId: character.id })}
                 style={{flex: 1, padding: '10px', background: '#f5f5f5', border: '2px solid #ccc', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center'}}
                 title="Нажмите, чтобы уведомить Мастера о коротком отдыхе. Восстановите ХП с помощью костей хитов вручную."
               >
                 <span style={{fontSize: '1.2rem'}}>☕</span>
                 <span style={{fontSize: '0.8rem', marginTop: '5px'}}>Короткий</span>
               </button>
               <button 
                 onClick={() => {
                   if(window.confirm('Закончить Длительный отдых? Это полностью восстановит ХП и обновит все ячейки магии.')) {
                     socket.emit('player_long_rest', { sessionId, charId: character.id });
                   }
                 }}
                 style={{flex: 1, padding: '10px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center'}}
                 title="Автоматически восстанавливает Макс. ХП и обнуляет потраченные Ячейки магии."
               >
                 <span style={{fontSize: '1.2rem'}}>🏕️</span>
                 <span style={{fontSize: '0.8rem', marginTop: '5px'}}>Длинный</span>
               </button>
             </div>
          </div>

          <div className="dnd-box cs-death-saves-box">
            <span className="dnd-box-title">Проверки перед смертью</span>
            <div className="cs-ds-row">
              <span>Успешно</span>
              <div className="cs-ds-circles">
                {[1,2,3].map(n => (
                  <input key={`succ-${n}`} type="checkbox" checked={character.deathSaves?.successes >= n} onChange={e => {
                    updateNestedField('deathSaves', 'successes', e.target.checked ? n : n - 1);
                  }} />
                ))}
              </div>
            </div>
            <div className="cs-ds-row">
              <span>Неудачно</span>
              <div className="cs-ds-circles">
                {[1,2,3].map(n => (
                  <input key={`fail-${n}`} type="checkbox" checked={character.deathSaves?.failures >= n} onChange={e => {
                    updateNestedField('deathSaves', 'failures', e.target.checked ? n : n - 1);
                  }} />
                ))}
              </div>
            </div>
          </div>

          <div className="dnd-box cs-textarea-box" style={{flex: 1, minHeight: '300px'}}>
             <table className="cs-attacks-table">
               <thead>
                 <tr>
                   <th>НАЗВАНИЕ</th>
                   <th style={{width: '60px'}}>БОНУС</th>
                   <th>УРОН/ВИД</th>
                   <th style={{width: '40px'}}></th>
                 </tr>
               </thead>
               <tbody>
                 {Array.from({length: character.attacks?.count || 3}).map((_, i) => (
                   <tr key={i}>
                     <td><input type="text" placeholder="Длинный меч" value={character.attacks?.[`${i}_name`] || ''} onChange={e => updateNestedField('attacks', `${i}_name`, e.target.value)} /></td>
                     <td><input type="text" placeholder="+5" style={{textAlign: 'center'}} value={character.attacks?.[`${i}_bonus`] || ''} onChange={e => updateNestedField('attacks', `${i}_bonus`, e.target.value)} /></td>
                     <td><input type="text" placeholder="1d8+3 руб" value={character.attacks?.[`${i}_damage`] || ''} onChange={e => updateNestedField('attacks', `${i}_damage`, e.target.value)} /></td>
                     <td>
                       <button 
                         onClick={() => {
                           const name = character.attacks?.[`${i}_name`];
                           if (name) {
                             socket.emit('dm_log_event', { sessionId, text: `⚔️ ${character.name} использует "${name}"!` });
                           }
                         }}
                         title="Использовать (отправит в лог Мастеру)"
                         style={{background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 8px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                       >
                         💥
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             <div style={{textAlign: 'center', marginTop: '5px'}}>
               <button onClick={() => updateNestedField('attacks', 'count', (character.attacks?.count || 3) + 1)} style={{background: 'none', border: '1px dashed #ccc', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', color: '#555'}}>+ Добавить строку</button>
             </div>
             <textarea value={character.attacksText || ''} onChange={e => updateField('attacksText', e.target.value)} style={{marginTop: '10px'}}></textarea>
             <span className="dnd-box-title">⚔️ АТАКИ И ✨ ЗАКЛИНАНИЯ</span>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="cs-col-right">
          
          <div className="dnd-box cs-textarea-box" style={{minHeight: '120px', flex: 'none', background: '#fdfdfd'}}>
             <div style={{padding: '10px 15px', paddingBottom: '30px'}}>
               {/* Состояния и баффы */}
               <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px'}}>
                 {(character.conditions ? CONDITIONS.filter(c => character.conditions[c.key]) : []).map(c => (
                   <span key={c.key} style={{background: '#ffebee', color: '#c62828', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #c62828'}}>{c.label.split(' (')[0]}</span>
                 ))}
                 {(character.buffs ? BUFFS.filter(b => character.buffs[b.key]) : []).map(b => (
                   <span key={b.key} style={{background: '#e8f5e9', color: '#2e7d32', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #2e7d32'}}>{b.label.split(' (')[0]}</span>
                 ))}
               </div>
               
               {/* Сопротивления */}
               <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px'}}>
                 {(character.resistances && Object.values(character.resistances).includes('resistance')) && (
                   <span style={{fontSize: '0.8rem', color: '#555'}}>🛡️ <b>Сопр:</b> {Object.keys(character.resistances).filter(k=>character.resistances[k] === 'resistance').map(k => DAMAGE_TYPES[k]).join(', ')}</span>
                 )}
                 {(character.resistances && Object.values(character.resistances).includes('immunity')) && (
                   <span style={{fontSize: '0.8rem', color: '#555'}}>✨ <b>Иммун:</b> {Object.keys(character.resistances).filter(k=>character.resistances[k] === 'immunity').map(k => DAMAGE_TYPES[k]).join(', ')}</span>
                 )}
                 {(character.resistances && Object.values(character.resistances).includes('vulnerability')) && (
                   <span style={{fontSize: '0.8rem', color: '#555'}}>💥 <b>Уязв:</b> {Object.keys(character.resistances).filter(k=>character.resistances[k] === 'vulnerability').map(k => DAMAGE_TYPES[k]).join(', ')}</span>
                 )}
               </div>

               {/* Экипировка */}
               <div style={{fontSize: '0.8rem', color: '#444'}}>
                 <b>Надето:</b> {
                   (character.inventory || []).filter(i => i.equipped).length > 0 
                   ? (character.inventory || []).filter(i => i.equipped).map(i => i.name).join(', ') 
                   : 'Нет надетой экипировки'
                 }
               </div>
             </div>
             <span className="dnd-box-title">АКТИВНЫЕ ЭФФЕКТЫ И ЭКИПИРОВКА</span>
          </div>

          <div className="dnd-box cs-textarea-box" style={{minHeight: '120px', flex: 'none'}}>
             <textarea value={character.personalityTraits || ''} onChange={e => updateField('personalityTraits', e.target.value)}></textarea>
             <span className="dnd-box-title">ОСОБЕННОСТИ ХАРАКТЕРА</span>
          </div>
          
          <div className="dnd-box cs-textarea-box" style={{minHeight: '100px', flex: 'none'}}>
             <textarea value={character.ideals || ''} onChange={e => updateField('ideals', e.target.value)}></textarea>
             <span className="dnd-box-title">ЖИЗНЕННЫЕ ПРИНЦИПЫ</span>
          </div>
          
          <div className="dnd-box cs-textarea-box" style={{minHeight: '100px', flex: 'none'}}>
             <textarea value={character.bonds || ''} onChange={e => updateField('bonds', e.target.value)}></textarea>
             <span className="dnd-box-title">ВАЖНЫЕ СВЯЗИ</span>
          </div>
          
          <div className="dnd-box cs-textarea-box" style={{minHeight: '100px', flex: 'none'}}>
             <textarea value={character.flaws || ''} onChange={e => updateField('flaws', e.target.value)}></textarea>
             <span className="dnd-box-title">НЕДОСТАТКИ ПЕРСОНАЖА</span>
          </div>
          
          <div className="dnd-box cs-textarea-box" style={{flex: 1, minHeight: '300px'}}>
             <textarea value={character.features || ''} onChange={e => updateField('features', e.target.value)}></textarea>
             <span className="dnd-box-title">УМЕНИЯ И ОСОБЕННОСТИ</span>
          </div>

        </div>

        </div>
      </div>
      )}

      {/* --- SPELLS TAB --- */}
      {activeTab === 'spells' && (
        <div className="tab-content fade-in">
          {/* СПЕЛЛКАСТИНГ И ЯЧЕЙКИ МАНЫ */}
          <div className="cs-spell-header" style={{display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap'}}>
             <div className="dnd-box" style={{flex: '1 1 200px', padding: '15px 10px 25px 10px', position: 'relative'}}>
                <select 
                  style={{width: '100%', padding: '5px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', border: 'none', outline: 'none', background: 'transparent'}} 
                  value={character.spellcastingAbility || 'cha'} 
                  onChange={e => updateField('spellcastingAbility', e.target.value)}
                >
                   <option value="int">Интеллект (Int)</option>
                   <option value="wis">Мудрость (Wis)</option>
                   <option value="cha">Харизма (Cha)</option>
                </select>
                <span className="dnd-box-title">БАЗОВАЯ ХАРАКТЕРИСТИКА</span>
             </div>
             <div className="dnd-box" style={{flex: '1 1 150px', padding: '15px 10px 25px 10px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <div style={{fontSize: '2rem', textAlign: 'center', fontWeight: 'bold'}}>
                  {8 + (character.proficiencyBonus || 2) + calculateMod(getCalculatedStat(character.spellcastingAbility || 'cha').total)}
                </div>
                <span className="dnd-box-title">СЛОЖНОСТЬ СПАСЕНИЯ</span>
             </div>
             <div className="dnd-box" style={{flex: '1 1 150px', padding: '15px 10px 25px 10px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <div style={{fontSize: '2rem', textAlign: 'center', fontWeight: 'bold'}}>
                  +{ (character.proficiencyBonus || 2) + calculateMod(getCalculatedStat(character.spellcastingAbility || 'cha').total)}
                </div>
                <span className="dnd-box-title">БОНУС АТАКИ ЗАКЛ.</span>
             </div>
          </div>

          <div className="dnd-box" style={{marginBottom: '20px'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', padding: '10px 10px 0 10px'}}>
               <span className="dnd-box-title" style={{margin: 0}}>ЯЧЕЙКИ ЗАКЛИНАНИЙ (МАНА)</span>
               <select 
                 value={character.casterType || 'full'}
                 onChange={e => updateField('casterType', e.target.value)}
                 style={{padding: '5px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem', background: 'white'}}
               >
                 <option value="full">Полный маг (Бард, Жрец, Волшебник...)</option>
                 <option value="half">Полу-кастер (Паладин, Следопыт)</option>
                 <option value="third">Треть-кастер (Мистич. рыцарь, Плут...)</option>
               </select>
             </div>
             <p style={{textAlign: 'center', color: '#666', fontSize: '0.85rem', margin: '10px 0 0 0'}}>Установите максимум ячеек для доступных уровней, чтобы иметь возможность их тратить.</p>
             <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '15px 5px'}}>
               {[1,2,3,4,5,6,7,8,9].map(level => {
                 const total = character.spellSlots?.[`${level}_total`] || 0;
                 const expended = character.spellSlots?.[`${level}_expended`] || 0;
                 
                 const charLevel = character.level || 1;
                 const casterType = character.casterType || 'full';
                 let effectiveLevel = charLevel;
                 if (casterType === 'half') {
                   effectiveLevel = charLevel < 2 ? 0 : Math.ceil(charLevel / 2);
                 } else if (casterType === 'third') {
                   effectiveLevel = charLevel < 3 ? 0 : Math.ceil(charLevel / 3);
                 }

                 // Показываем уровень ячейки, если:
                 // 1. У него уже задан максимум > 0
                 // 2. Уровень ячейки доступен классу текущего уровня
                 const maxVisibleLevel = Math.max(1, Math.min(9, Math.ceil(effectiveLevel / 2)));
                 if (total === 0 && level > maxVisibleLevel) return null;

                 const recommendedSlots = effectiveLevel > 0 ? (FULL_CASTER_SLOTS[effectiveLevel > 20 ? 20 : effectiveLevel]?.[level - 1] || 0) : 0;

                 return (
                   <div key={level} style={{border: total > 0 ? '2px solid #1976d2' : '1px dashed #ccc', borderRadius: '8px', padding: '10px', flex: '1 1 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: total > 0 ? '#f0f7ff' : '#f9f9f9', opacity: total > 0 ? 1 : 0.6}}>
                     <div style={{fontWeight: 'bold', marginBottom: '8px', color: total > 0 ? '#1976d2' : '#666'}}>{level} уровень</div>
                     <div style={{display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', marginBottom: '10px', background: 'white', padding: '2px 5px', borderRadius: '4px', border: '1px solid #ccc'}}>
                       <span style={{fontWeight: 'bold'}}>Макс:</span>
                       <input 
                         type="number" 
                         value={total} 
                         onChange={e => updateNestedField('spellSlots', `${level}_total`, Math.max(0, parseInt(e.target.value) || 0))} 
                         style={{width: '45px', textAlign: 'center', border: 'none', outline: 'none', fontWeight: 'bold', fontSize: '1.1rem'}}
                         min="0"
                       />
                     </div>
                     <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center', minHeight: '24px'}}>
                       {total === 0 ? (
                         <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                           <span style={{fontSize: '0.7rem', color: '#999'}}>Нет ячеек</span>
                           {recommendedSlots > 0 && (
                             <span 
                               style={{fontSize: '0.75rem', color: '#1976d2', cursor: 'pointer', fontWeight: 'bold', marginTop: '2px', padding: '2px 5px', borderRadius: '4px', background: '#e3f2fd'}}
                               onClick={() => updateNestedField('spellSlots', `${level}_total`, recommendedSlots)}
                               title="Кликните, чтобы применить стандартное значение для вашего уровня"
                             >
                               Реком: {recommendedSlots} (клик)
                             </span>
                           )}
                         </div>
                       ) : (
                         Array.from({length: total}).map((_, idx) => (
                           <div 
                             key={idx} 
                             onClick={() => {
                               // Тогл: если кликаем по потраченной (красной) ячейке - восстанавливаем, иначе тратим
                               if (idx < expended) {
                                 updateNestedField('spellSlots', `${level}_expended`, idx);
                               } else {
                                 updateNestedField('spellSlots', `${level}_expended`, idx + 1);
                               }
                             }}
                             style={{
                               width: '24px', height: '24px', borderRadius: '50%', 
                               border: '2px solid black', 
                               background: idx < expended ? '#d32f2f' : '#4caf50',
                               cursor: 'pointer',
                               boxShadow: '1px 1px 3px rgba(0,0,0,0.3)'
                             }}
                             title={idx < expended ? "Потрачено. Кликните чтобы восстановить" : "Доступно. Кликните чтобы потратить"}
                           />
                         ))
                       )}
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>

          <div className="dnd-box" style={{paddingBottom: '30px'}}>
             <div style={{display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap'}}>
               <input 
                 type="text" 
                 placeholder="Название заклинания (например: Огненный шар)..." 
                 value={spellSearch} 
                 onChange={e => setSpellSearch(e.target.value)} 
                 style={{flex: '1 1 200px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px'}}
               />
               <select 
                 value={spellClassFilter} 
                 onChange={e => setSpellClassFilter(e.target.value)}
                 style={{flex: '1 1 120px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: 'white'}}
               >
                 <option value="Все классы">Все классы</option>
                 <option value="Бард">Бард</option>
                 <option value="Жрец">Жрец</option>
                 <option value="Друид">Друид</option>
                 <option value="Паладин">Паладин</option>
                 <option value="Следопыт">Следопыт</option>
                 <option value="Чародей">Чародей</option>
                 <option value="Колдун">Колдун</option>
                 <option value="Волшебник">Волшебник</option>
               </select>
               <select 
                 value={spellLevelFilter} 
                 onChange={e => setSpellLevelFilter(e.target.value)}
                 style={{flex: '1 1 120px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: 'white'}}
               >
                 <option value="Все уровни">Все уровни</option>
                 <option value="0">Заговоры</option>
                 <option value="1">1 уровень</option>
                 <option value="2">2 уровень</option>
                 <option value="3">3 уровень</option>
                 <option value="4">4 уровень</option>
                 <option value="5">5 уровень</option>
                 <option value="6">6 уровень</option>
                 <option value="7">7 уровень</option>
                 <option value="8">8 уровень</option>
                 <option value="9">9 уровень</option>
               </select>
             </div>
             <span className="dnd-box-title">ДОБАВИТЬ ЗАКЛИНАНИЕ</span>
             
             {(spellSearch.length > 1 || spellClassFilter !== 'Все классы' || spellLevelFilter !== 'Все уровни') && (
               <div style={{marginTop: '10px', background: '#f9f9f9', border: '1px solid #ccc', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto'}}>
                 {(Array.isArray(spellsData) ? spellsData : []).filter(s => {
                    const matchName = (s?.name || '').toLowerCase().includes((spellSearch || '').toLowerCase());
                    const matchClass = spellClassFilter === 'Все классы' || (s.classes && s.classes.includes(spellClassFilter));
                    const matchLevel = spellLevelFilter === 'Все уровни' || s.level === parseInt(spellLevelFilter);
                    return matchName && matchClass && matchLevel;
                 }).map((spell, i) => (
                   <div key={i} style={{padding: '10px', borderBottom: '1px solid #eee'}}>
                     <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                       <div 
                         style={{flex: 1, cursor: 'pointer'}} 
                         onClick={() => setExpandedSpellPreview(expandedSpellPreview === spell.name ? null : spell.name)}
                       >
                         <div style={{fontWeight: 'bold', color: '#1976d2'}}>
                           {spell.name} <span style={{fontSize: '0.8rem', color: '#666'}}>({spell.level > 0 ? `${spell.level} ур.` : 'Заговор'})</span>
                           <span style={{fontSize: '0.7rem', marginLeft: '5px', color: '#888'}}>{expandedSpellPreview === spell.name ? '▲ скрыть' : '▼ подробнее'}</span>
                         </div>
                         <div style={{fontSize: '0.8rem', color: '#888'}}>{spell.school} • {spell.castingTime} • {spell.range}</div>
                       </div>
                       <button 
                         onClick={() => {
                           const currentSpells = character.spells || [];
                           if(!currentSpells.find(s => s.name === spell.name)) {
                             updateField('spells', [...currentSpells, spell]);
                           }
                           setSpellSearch('');
                           setExpandedSpellPreview(null);
                         }}
                         style={{background: '#388e3c', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px'}}
                       >
                         +
                       </button>
                     </div>
                     
                     {/* Расширенное описание */}
                     {expandedSpellPreview === spell.name && (
                       <div style={{marginTop: '10px', fontSize: '0.85rem', color: '#444', background: '#e3f2fd', padding: '10px', borderRadius: '4px'}}>
                         <div style={{marginBottom: '5px'}}><strong>Компоненты:</strong> {spell.components}</div>
                         <div style={{marginBottom: '5px'}}><strong>Длительность:</strong> {spell.duration}</div>
                         <div style={{whiteSpace: 'pre-wrap', marginTop: '5px', paddingTop: '5px', borderTop: '1px solid #bbdefb'}}>{spell.description}</div>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             )}
          </div>

          <div className="dnd-box" style={{marginTop: '20px', minHeight: '300px', paddingBottom: '30px', background: 'transparent', border: 'none'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px'}}>
               <h3 style={{fontFamily: 'sans-serif', margin: 0}}>КНИГА ЗАКЛИНАНИЙ</h3>
               <button 
                 onClick={() => {
                   const customSpell = {
                     name: "Новое кастомное заклинание",
                     level: 1,
                     school: "Своё",
                     castingTime: "1 действие",
                     range: "30 футов",
                     components: "В, С",
                     duration: "Мгновенная",
                     description: "Опишите ваше заклинание или способность...",
                     isCustom: true
                   };
                   updateField('spells', [...(character.spells || []), customSpell]);
                 }}
                 style={{background: '#8e24aa', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem'}}
               >
                 ✨ СОЗДАТЬ СВОЁ
               </button>
             </div>
             
             <div style={{background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '10px', marginBottom: '15px', fontSize: '0.85rem', color: '#555'}}>
               <span style={{fontWeight: 'bold', color: '#333'}}>🗣 Компоненты:</span> 
               <strong style={{marginLeft: '5px'}}>В</strong> (Вербальный, голос) • 
               <strong style={{marginLeft: '5px'}}>С</strong> (Соматический, жесты) • 
               <strong style={{marginLeft: '5px'}}>М</strong> (Материальный, предмет)
             </div>
             
             {(!character.spells || character.spells.length === 0) && (
               <p style={{color: '#888', textAlign: 'center', marginTop: '20px'}}>Книга пуста. Найдите заклинания выше.</p>
             )}
             
             {/* Группировка заклинаний по уровням */}
             {Array.from({length: 10}).map((_, lvl) => {
               const levelSpells = (character.spells || []).map((s, idx) => ({...s, originalIndex: idx})).filter(s => s.level === lvl);
               if (levelSpells.length === 0) return null;
               
               return (
                 <div key={lvl} style={{marginBottom: '20px'}}>
                   <h4 style={{borderBottom: '2px solid black', paddingBottom: '5px', margin: '0 0 10px 0'}}>
                     {lvl === 0 ? 'Заговоры (Cantrips)' : `${lvl} уровень`}
                   </h4>
                   <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                     {levelSpells.map(spell => (
                       <div key={spell.originalIndex} style={{border: '1px solid #ccc', borderRadius: '8px', padding: '15px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                         <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px'}}>
                           <div style={{flex: 1, minWidth: '200px'}}>
                             {spell.isCustom ? (
                                <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
                                  <input type='text' value={spell.name} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].name=e.target.value;updateField('spells',s);}} style={{fontWeight:'bold',fontSize:'1.2rem',color:'#1976d2',border:'1px solid #ccc',padding:'5px',borderRadius:'4px'}} placeholder='Название'/>
                                  <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                                    <input type='text' value={spell.castingTime} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].castingTime=e.target.value;updateField('spells',s);}} placeholder='Время каста' style={{padding:'5px',flex:1,minWidth:'80px',border:'1px solid #eee', fontSize:'0.85rem'}}/>
                                    <input type='text' value={spell.range} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].range=e.target.value;updateField('spells',s);}} placeholder='Дистанция' style={{padding:'5px',flex:1,minWidth:'80px',border:'1px solid #eee', fontSize:'0.85rem'}}/>
                                  </div>
                                  <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                                    <input type='text' value={spell.components} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].components=e.target.value;updateField('spells',s);}} placeholder='Компоненты (В, С, М)' style={{padding:'5px',flex:1,minWidth:'80px',border:'1px solid #eee', fontSize:'0.85rem'}}/>
                                    <input type='text' value={spell.duration} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].duration=e.target.value;updateField('spells',s);}} placeholder='Длительность' style={{padding:'5px',flex:1,minWidth:'80px',border:'1px solid #eee', fontSize:'0.85rem'}}/>
                                  </div>
                                   <div style={{display:'flex',gap:'5px',alignItems:'center',flexWrap:'wrap'}}>
                                     <label style={{fontSize:'0.85rem',fontWeight:'bold',color:'#555'}}>Уровень:</label>
                                     <select value={spell.level} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].level=parseInt(e.target.value);updateField('spells',s);}} style={{padding:'3px 5px',border:'1px solid #eee',borderRadius:'4px',fontSize:'0.85rem'}}>
                                       <option value={0}>Заговор (0)</option>
                                       {[1,2,3,4,5,6,7,8,9].map(n=><option key={n} value={n}>{n} уровень</option>)}
                                     </select>
                                   </div>
                                </div>
                              ) : (
                                <>
                                  <div style={{fontWeight: 'bold', fontSize: '1.2rem', color: '#1976d2'}}>{spell.name}</div>
                                  <div style={{fontSize: '0.85rem', color: '#666', marginTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                                    <span>⏱ {spell.castingTime}</span>
                                    <span>🎯 {spell.range}</span>
                                    <span>🗣 {spell.components}</span>
                                    <span>⏳ {spell.duration}</span>
                                  </div>
                                </>
                              )}
                            </div>
                           <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                             {lvl > 0 && (
                               <button 
                                 onClick={() => {
                                    const total = character.spellSlots?.[`${lvl}_total`] || 0;
                                    const expended = character.spellSlots?.[`${lvl}_expended`] || 0;
                                    if (expended >= total) {
                                       alert(`Не хватает ячеек ${lvl} уровня! (Потрачено ${expended} из ${total})`);
                                    } else {
                                       updateNestedField('spellSlots', `${lvl}_expended`, expended + 1);
                                       socket.emit('dm_log_event', { sessionId, text: `✨ ${character.name} кастует "${spell.name}" (Потрачена ячейка ${lvl} ур.)` });
                                    }
                                 }}
                                 style={{background: '#d32f2f', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '5px'}}
                               >
                                 💥 СКАСТОВАТЬ
                               </button>
                             )}
                             <button 
                               onClick={() => {
                                 if(window.confirm(`Удалить заклинание "${spell.name}"?`)) {
                                   updateField('spells', character.spells.filter((_, idx) => idx !== spell.originalIndex));
                                 }
                               }}
                               style={{background: '#eee', border: '1px solid #ccc', color: '#666', cursor: 'pointer', fontSize: '1rem', padding: '8px', borderRadius: '6px'}}
                               title="Удалить"
                             >
                               🗑️
                             </button>
                           </div>
                         </div>
                         {spell.isCustom ? (
                           <textarea 
                             value={spell.description} 
                             onChange={e => { const s=[...character.spells]; s[spell.originalIndex].description = e.target.value; updateField('spells', s); }}
                             style={{width: '100%', minHeight: '60px', marginTop: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical', fontSize: '0.95rem'}}
                           />
                         ) : (
                           <div style={{fontSize: '0.95rem', marginTop: '10px', borderTop: '1px dashed #ccc', paddingTop: '10px', lineHeight: '1.4'}}>
                             {spell.description}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               );
             })}
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="cs-tab-content" style={{paddingBottom: '20px'}}>
          <h2 style={{fontFamily: 'sans-serif', textAlign: 'center', marginBottom: '20px'}}>🎒 Инвентарь и Экипировка</h2>
          
          <div className="dnd-box" style={{marginBottom: '20px', padding: '15px 15px 30px 15px', position: 'relative'}}>
             <span className="dnd-box-title">ДЕНЬГИ</span>
             <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                {[
                  {key: 'ММ', label: 'Медь'}, 
                  {key: 'СМ', label: 'Серебро'}, 
                  {key: 'ЭМ', label: 'Электрум'}, 
                  {key: 'ЗМ', label: 'Золото'}, 
                  {key: 'ПМ', label: 'Платина'}
                ].map(coin => (
                   <div key={coin.key} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1}}>
                      <input type="number" value={character.coins?.[coin.key] || 0} onChange={e => updateNestedField('coins', coin.key, parseInt(e.target.value) || 0)} style={{width: '100%', textAlign: 'center', border: '1px solid black', borderRadius: '4px', padding: '5px', fontWeight: 'bold'}} />
                      <span style={{fontSize: '0.75rem', fontWeight: 'bold', marginTop: '5px'}}>{coin.label}</span>
                   </div>
                ))}
             </div>
          </div>

          <div className="dnd-box cs-list-box" style={{minHeight: '400px'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f4f4f4', padding: '10px', borderBottom: '2px solid black', margin: '-10px -10px 10px -10px', flexWrap: 'wrap', gap: '10px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap'}}>
                  <span style={{fontWeight: 'bold'}}>СПИСОК ПРЕДМЕТОВ</span>
                  {(() => {
                    const strScore = getCalculatedStat('str').total || 10;
                    const maxWeight = strScore * 15;
                    const totalWeight = (character.inventory || []).reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
                    const isEncumbered = totalWeight > maxWeight;
                    return (
                      <span style={{fontSize: '0.85rem', padding: '4px 8px', borderRadius: '4px', background: isEncumbered ? '#ffebee' : '#e8f5e9', color: isEncumbered ? '#c62828' : '#2e7d32', border: `1px solid ${isEncumbered ? '#ef9a9a' : '#a5d6a7'}`, fontWeight: 'bold'}}>
                        ⚖️ Вес: {totalWeight.toFixed(1)} / {maxWeight} фунтов {isEncumbered && ' (ПЕРЕГРУЗ!)'}
                      </span>
                    );
                  })()}
                </div>
                <button 
                  onClick={() => {
                     const newItem = { id: Date.now(), name: '', equipped: false, type: 'gear', ac: 0, statBonus: '', statValue: 0, weight: 0 };
                     const inv = character.inventory || [];
                     updateField('inventory', [...inv, newItem]);
                  }}
                  style={{background: 'black', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
                >+ ДОБАВИТЬ ПРЕДМЕТ</button>
             </div>

             <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                {!(character.inventory && character.inventory.length > 0) && (
                   <p style={{textAlign: 'center', color: '#888', fontStyle: 'italic', padding: '20px'}}>Инвентарь пуст. Добавьте свой первый предмет!</p>
                )}
                {(character.inventory || []).map((item, index) => (
                   <div key={item.id} style={{border: '1px solid #ccc', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', background: item.equipped ? '#f0f8ff' : 'white'}}>
                      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                         <input 
                           type="checkbox" 
                           checked={item.equipped} 
                           onChange={e => {
                              const newInv = [...character.inventory];
                              newInv[index].equipped = e.target.checked;
                              updateField('inventory', newInv);
                           }} 
                           title="Экипировано" 
                           style={{width: '20px', height: '20px', cursor: 'pointer'}} 
                         />
                         <input 
                           type="text" 
                           placeholder="Название предмета..." 
                           value={item.name} 
                           onChange={e => {
                              const newInv = [...character.inventory];
                              newInv[index].name = e.target.value;
                              updateField('inventory', newInv);
                           }} 
                           style={{flex: 1, border: 'none', borderBottom: '1px solid black', outline: 'none', fontSize: '1.1rem', fontWeight: 'bold', background: 'transparent'}} 
                         />
                         <button 
                           onClick={() => {
                              const newInv = character.inventory.filter((_, i) => i !== index);
                              updateField('inventory', newInv);
                           }}
                           style={{background: 'red', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer'}}
                         >Удалить</button>
                      </div>
                      
                      <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.85rem'}}>
                         <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <label style={{fontWeight: 'bold'}}>Тип:</label>
                            <select 
                              value={item.type} 
                              onChange={e => {
                                 const newInv = [...character.inventory];
                                 newInv[index].type = e.target.value;
                                 updateField('inventory', newInv);
                              }}
                              style={{padding: '3px', borderRadius: '4px', border: '1px solid #ccc'}}
                            >
                               <option value="gear">Обычный предмет</option>
                               <option value="armor">Броня (Задает КБ)</option>
                               <option value="shield">Щит / Защита (+ к КБ)</option>
                               <option value="magic">Магический предмет</option>
                            </select>
                         </div>
                         
                         {(item.type === 'armor' || item.type === 'shield' || item.type === 'magic') && (
                            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                               <label style={{fontWeight: 'bold'}}>{item.type === 'armor' ? 'Базовый КБ:' : 'Бонус к КБ:'}</label>
                               <input 
                                 type="number" 
                                 value={item.ac || 0} 
                                 onChange={e => {
                                    const newInv = [...character.inventory];
                                    newInv[index].ac = parseInt(e.target.value) || 0;
                                    updateField('inventory', newInv);
                                 }}
                                 style={{width: '50px', padding: '3px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px'}}
                               />
                            </div>
                         )}

                         <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <label style={{fontWeight: 'bold'}}>Вес:</label>
                            <input 
                              type="number" 
                              value={item.weight || 0} 
                              onChange={e => {
                                 const newInv = [...character.inventory];
                                 newInv[index].weight = parseFloat(e.target.value) || 0;
                                 updateField('inventory', newInv);
                              }}
                              style={{width: '60px', padding: '3px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px'}}
                              min="0"
                              step="0.1"
                            />
                         </div>

                         <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <label style={{fontWeight: 'bold'}}>Бонус к характеристике:</label>
                            <select 
                              value={item.statBonus} 
                              onChange={e => {
                                 const newInv = [...character.inventory];
                                 newInv[index].statBonus = e.target.value;
                                 updateField('inventory', newInv);
                              }}
                              style={{padding: '3px', borderRadius: '4px', border: '1px solid #ccc'}}
                            >
                               <option value="">Нет</option>
                               <option value="str">Сила</option>
                               <option value="dex">Ловкость</option>
                               <option value="con">Телосложение</option>
                               <option value="int">Интеллект</option>
                               <option value="wis">Мудрость</option>
                               <option value="cha">Харизма</option>
                            </select>
                            {item.statBonus && (
                               <input 
                                 type="number" 
                                 value={item.statValue || 0} 
                                 onChange={e => {
                                    const newInv = [...character.inventory];
                                    newInv[index].statValue = parseInt(e.target.value) || 0;
                                    updateField('inventory', newInv);
                                 }}
                                 style={{width: '50px', padding: '3px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px'}}
                               />
                            )}
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* --- CONDITIONS TAB --- */}
      {activeTab === 'more' && (
        <div className="cs-tab-content" style={{paddingBottom: '20px'}}>
          <h2 style={{fontFamily: 'sans-serif', textAlign: 'center', marginBottom: '20px'}}>⚠️ Состояния</h2>
          
          <div className="dnd-box" style={{marginBottom: '20px'}}>
             <span className="dnd-box-title">ПОЛОЖИТЕЛЬНЫЕ ЭФФЕКТЫ (БАФФЫ)</span>
             <div style={{display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px 0'}}>
                {BUFFS.map(buff => (
                   <div key={buff.key} style={{display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                      <input 
                        type="checkbox" 
                        style={{transform: 'scale(1.5)', margin: '5px 10px'}}
                        checked={character.buffs?.[buff.key] || false}
                        onChange={e => updateNestedField('buffs', buff.key, e.target.checked)}
                      />
                      <span style={{fontSize: '1rem', color: character.buffs?.[buff.key] ? '#2e7d32' : 'black', fontWeight: character.buffs?.[buff.key] ? 'bold' : 'normal'}}>{buff.label}</span>
                   </div>
                ))}
             </div>
          </div>

          <div className="dnd-box" style={{marginBottom: '20px'}}>
             <span className="dnd-box-title">УЯЗВИМОСТИ, СОПРОТИВЛЕНИЯ И ИММУНИТЕТЫ</span>
             <p style={{fontSize: '0.8rem', color: '#666', marginTop: '10px', marginBottom: '10px'}}>
               Если вы выберете тип урона здесь, приложение автоматически рассчитает его при атаке (x2, /2 или 0).
             </p>
             <div style={{display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px 0'}}>
                {Object.entries(DAMAGE_TYPES).map(([key, label]) => (
                   <div key={key} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                      <span style={{fontSize: '1rem', fontWeight: 'bold'}}>{label}</span>
                      <select 
                        value={character.resistances?.[key] || 'normal'} 
                        onChange={e => updateNestedField('resistances', key, e.target.value)}
                        style={{padding: '5px', borderRadius: '4px', border: '1px solid #ccc', background: character.resistances?.[key] && character.resistances?.[key] !== 'normal' ? '#e3f2fd' : 'white'}}
                      >
                        <option value="normal">Обычный урон</option>
                        <option value="vulnerability">Уязвимость (x2 урон)</option>
                        <option value="resistance">Сопротивление (/2 урон)</option>
                        <option value="immunity">Иммунитет (0 урона)</option>
                      </select>
                   </div>
                ))}
             </div>
          </div>

          <div className="dnd-box" style={{marginBottom: '20px'}}>
             <span className="dnd-box-title">НЕГАТИВНЫЕ ЭФФЕКТЫ (ДЕБАФФЫ)</span>
             <div style={{display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px 0'}}>
                {CONDITIONS.map(cond => (
                   <div key={cond.key} style={{display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                      <input 
                        type="checkbox" 
                        style={{transform: 'scale(1.5)', margin: '5px 10px'}}
                        checked={character.conditions?.[cond.key] || false}
                        onChange={e => updateNestedField('conditions', cond.key, e.target.checked)}
                      />
                      <span style={{fontSize: '1rem', color: character.conditions?.[cond.key] ? '#d32f2f' : 'black', fontWeight: character.conditions?.[cond.key] ? 'bold' : 'normal'}}>{cond.label}</span>
                   </div>
                ))}
             </div>
             <p style={{fontSize: '0.8rem', color: '#666', marginTop: '10px', textAlign: 'center'}}>Если у вас активно состояние, приложение предупредит вас об этом при броске кубиков.</p>
          </div>
        </div>
      )}

      </div>

      {/* BOTTOM NAVIGATION */}
      <nav className="bottom-nav">
        <button className={`bottom-nav-btn ${activeTab === 'character' ? 'active' : ''}`} onClick={() => setActiveTab('character')}>
          <span className="bottom-nav-icon">📄</span>
          Персонаж
        </button>
        <button className={`bottom-nav-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
          <span className="bottom-nav-icon">🎒</span>
          Инвентарь
        </button>
        <button className={`bottom-nav-btn ${activeTab === 'more' ? 'active' : ''}`} onClick={() => setActiveTab('more')}>
          <span className="bottom-nav-icon">⚠️</span>
          Состояния
        </button>
        <button className={`bottom-nav-btn ${activeTab === 'spells' ? 'active' : ''}`} onClick={() => setActiveTab('spells')}>
          <span className="bottom-nav-icon">🔮</span>
          Заклинания
        </button>
      </nav>
    </>
  );
}
