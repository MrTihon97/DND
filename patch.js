import fs from 'fs';
let c = fs.readFileSync('src/CharacterSheet.jsx', 'utf8');

c = c.replace(
  `<div style={{fontWeight: 'bold', fontSize: '1.2rem', color: '#1976d2'}}>{spell.name}</div>`,
  `{spell.isCustom ? (
    <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
      <input type='text' value={spell.name} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].name=e.target.value;updateField('spells',s);}} style={{fontWeight:'bold',fontSize:'1.2rem',color:'#1976d2',border:'1px solid #ccc',padding:'5px',borderRadius:'4px'}}/>
      <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
        <input type='text' value={spell.castingTime} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].castingTime=e.target.value;updateField('spells',s);}} placeholder='Время каста' style={{padding:'5px',flex:1,minWidth:'80px',border:'1px solid #eee'}}/>
        <input type='text' value={spell.range} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].range=e.target.value;updateField('spells',s);}} placeholder='Дистанция' style={{padding:'5px',flex:1,minWidth:'80px',border:'1px solid #eee'}}/>
      </div>
    </div>
  ) : (
    <div style={{fontWeight: 'bold', fontSize: '1.2rem', color: '#1976d2'}}>{spell.name}</div>
  )}`
);

c = c.replace(
  `{spell.description}\r\n                          </div>`,
  `{spell.isCustom ? (
    <textarea value={spell.description} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].description=e.target.value;updateField('spells',s);}} style={{width:'100%',minHeight:'60px',marginTop:'10px',padding:'8px',border:'1px solid #ccc',borderRadius:'4px',resize:'vertical',fontSize:'0.95rem'}}/>
  ) : (
    spell.description
  )}\r\n                          </div>`
);

// Fallback for LF
c = c.replace(
  `{spell.description}\n                          </div>`,
  `{spell.isCustom ? (
    <textarea value={spell.description} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].description=e.target.value;updateField('spells',s);}} style={{width:'100%',minHeight:'60px',marginTop:'10px',padding:'8px',border:'1px solid #ccc',borderRadius:'4px',resize:'vertical',fontSize:'0.95rem'}}/>
  ) : (
    spell.description
  )}\n                          </div>`
);

fs.writeFileSync('src/CharacterSheet.jsx', c);
