import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Раздаем статику из папки dist (билд React)
app.use(express.static(path.join(__dirname, 'dist')));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Initial state
const db = {
  characters: [], // Starts empty so users can create their own
  log: []
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_session', (sessionId) => {
    socket.join(sessionId);
    console.log(`User ${socket.id} joined ${sessionId}`);
    
    // Send current state
    const chars = db.characters.filter(c => c.sessionId === sessionId);
    socket.emit('initial_state', chars);
    socket.emit('log_updated', db.log);
  });

  socket.on('create_character', (charData) => {
    const newChar = {
      id: `char_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      sessionId: charData.sessionId || 'room_1',
      name: charData.name || "Новый Персонаж",
      classLevel: "",
      race: "",
      hp: { current: 10, max: 10, temp: 0 },
      ac: 10,
      initiative: 0,
      stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      skills: {},
      saves: {},
      proficiencyBonus: 2,
      ...charData
    };
    db.characters.push(newChar);
    io.to(newChar.sessionId).emit('char_updated', newChar); // send to everyone
  });

  socket.on('delete_character', (req) => {
    db.characters = db.characters.filter(c => c.id !== req.id);
    const chars = db.characters.filter(c => c.sessionId === req.sessionId);
    io.to(req.sessionId).emit('initial_state', chars);
  });

  socket.on('update_character', (updatedChar) => {
    const index = db.characters.findIndex(c => c.id === updatedChar.id);
    if (index !== -1) {
      db.characters[index] = { ...db.characters[index], ...updatedChar };
      // Broadcast to everyone in the room
      io.to(updatedChar.sessionId).emit('char_updated', db.characters[index]);
    }
  });

  socket.on('update_hp', ({ charId, amount }) => {
    const char = db.characters.find(c => c.id === charId);
    if (char) {
      char.hp.current = Math.max(0, Math.min(char.hp.max, char.hp.current + amount));
      io.to(char.sessionId).emit('char_updated', char);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // --- EVENT SYSTEM ---
  
  // DM sends a request to players
  socket.on('dm_request_save', (requestData) => {
    // requestData: { id, sessionId, stat, statLabel, dc, targetIds }
    io.to(requestData.sessionId).emit('player_save_request', requestData);
  });

  socket.on('dm_request_skill', (requestData) => {
    io.to(requestData.sessionId).emit('player_skill_request', requestData);
  });

  socket.on('dm_request_initiative', (requestData) => {
    io.to(requestData.sessionId).emit('player_initiative_request', requestData);
  });

  const addLog = (sessionId, text) => {
    const logEntry = {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text
    };
    db.log.unshift(logEntry);
    if(db.log.length > 50) db.log.pop();
    io.to(sessionId).emit('log_updated', db.log);
  };

  socket.on('dm_log_event', ({ sessionId, text }) => {
    addLog(sessionId, text);
  });

  socket.on('clear_log', (sessionId) => {
    db.log = [];
    io.to(sessionId).emit('log_updated', db.log);
  });

  // Player sends the dice roll result back
  socket.on('player_save_response', (res) => {
    const text = res.customText 
      ? `[${res.charName}] ${res.customText}` 
      : `[${res.statLabel}] ${res.charName} результат: ${res.total} (СЛ ${res.dc}). ${res.isSuccess ? '✅ УСПЕХ' : '❌ ПРОВАЛ'}`;
    addLog(res.sessionId, text);
  });

  // DM sends an attack
  socket.on('dm_attack_request', (attackData) => {
    io.to(attackData.sessionId).emit('player_attack_request', attackData);
  });

  // Player responds to attack (took damage or dodged)
  socket.on('player_attack_response', (res) => {
    const text = res.isHit ? `Монстр пробил КБ ${res.ac} и нанес ${res.damage} урона.` : `Игрок отбил атаку (КБ ${res.ac}).`;
    addLog(res.sessionId, `[${res.charName}] ${text}`);
  });

  // Rests
  socket.on('dm_long_rest', (sessionId) => {
    db.characters.filter(c => c.sessionId === sessionId).forEach(char => {
      // Reset HP
      if (char.hp && char.hp.max) {
        char.hp.current = char.hp.max;
        char.hp.temp = 0;
      }
      // Reset Hit Dice
      if (char.hitDice) {
        char.hitDice.current = char.level || 1;
      } else {
        char.hitDice = { current: char.level || 1 };
      }
      // Clear conditions and buffs
      char.conditions = {};
      char.buffs = {};
      // Reset spell slots
      if (char.spellSlots) {
        Object.keys(char.spellSlots).forEach(k => {
          if (k.endsWith('_expended')) {
            char.spellSlots[k] = 0;
          }
        });
      }
    });
    
    // Broadcast updated state
    const chars = db.characters.filter(c => c.sessionId === sessionId);
    io.to(sessionId).emit('initial_state', chars);
    
    addLog(sessionId, '🏕️ Мастер объявил Длительный отдых. ХП и ячейки магии восстановлены, все эффекты сняты.');
  });

  socket.on('player_long_rest', ({ sessionId, charId }) => {
    const char = db.characters.find(c => c.id === charId);
    if (char) {
      if (char.hp && char.hp.max) {
        char.hp.current = char.hp.max;
        char.hp.temp = 0;
      }
      if (char.hitDice) char.hitDice.current = char.level || 1;
      else char.hitDice = { current: char.level || 1 };
      char.conditions = {};
      char.buffs = {};
      char.deathSaves = { successes: 0, failures: 0 };
      if (char.spellSlots) {
        Object.keys(char.spellSlots).forEach(k => {
          if (k.endsWith('_expended')) char.spellSlots[k] = 0;
        });
      }
      io.to(sessionId).emit('char_updated', char);
      addLog(sessionId, `🏕️ ${char.name} закончил Длительный отдых.`);
    }
  });

  socket.on('player_short_rest', ({ sessionId, charId }) => {
    const char = db.characters.find(c => c.id === charId);
    if (char) {
      addLog(sessionId, `☕ ${char.name} присел на Короткий отдых.`);
    }
  });

  socket.on('dm_short_rest', (sessionId) => {
    addLog(sessionId, '☕ Мастер объявил Короткий отдых. Игроки могут потратить Кости хитов для лечения.');
  });

  // Free text event
  socket.on('dm_story_event', (eventData) => {
    addLog(eventData.sessionId, eventData.text);
  });
});

// Любые другие GET запросы отправляем на React-приложение
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO and Express server running on port ${PORT}`);
});
