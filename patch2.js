import fs from 'fs';
let c = fs.readFileSync('src/CharacterSheet.jsx', 'utf8');

const target = `                              {spell.isCustom ? (
    <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
      <input type='text' value={spell.name} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].name=e.target.value;updateField('spells',s);}} style={{fontWeight:'bold',fontSize:'1.2rem',color:'#1976d2',border:'1px solid #ccc',padding:'5px',borderRadius:'4px'}}/>
      <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
        <input type='text' value={spell.castingTime} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].castingTime=e.target.value;updateField('spells',s);}} placeholder='Время каста' style={{padding:'5px',flex:1,minWidth:'80px',border:'1px solid #eee'}}/>
        <input type='text' value={spell.range} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].range=e.target.value;updateField('spells',s);}} placeholder='Дистанция' style={{padding:'5px',flex:1,minWidth:'80px',border:'1px solid #eee'}}/>
      </div>
    </div>
  ) : (
    <div style={{fontWeight: 'bold', fontSize: '1.2rem', color: '#1976d2'}}>{spell.name}</div>
  )}
                              <div style={{fontSize: '0.85rem', color: '#666', marginTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                                <span>⏱ {spell.castingTime}</span>
                                <span>🎯 {spell.range}</span>
                                <span>🗣 {spell.components}</span>
                                <span>⏳ {spell.duration}</span>
                              </div>
                            </div>`;

const targetLF = target.replace(/\r\n/g, '\n');

const replacement = `                              {spell.isCustom ? (
                                <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
                                  <input type='text' value={spell.name} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].name=e.target.value;updateField('spells',s);}} style={{fontWeight:'bold',fontSize:'1.2rem',color:'#1976d2',border:'1px solid #ccc',padding:'5px',borderRadius:'4px'}} placeholder='Название'/>
                                  <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                                    <input type='text' value={spell.castingTime} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].castingTime=e.target.value;updateField('spells',s);}} placeholder='Время каста' style={{padding:'5px',flex:1,minWidth:'80px',border:'1px solid #eee'}}/>
                                    <input type='text' value={spell.range} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].range=e.target.value;updateField('spells',s);}} placeholder='Дистанция' style={{padding:'5px',flex:1,minWidth:'80px',border:'1px solid #eee'}}/>
                                  </div>
                                  <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                                    <input type='text' value={spell.components} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].components=e.target.value;updateField('spells',s);}} placeholder='Компоненты (В, С, М)' style={{padding:'5px',flex:1,minWidth:'80px',border:'1px solid #eee'}}/>
                                    <input type='text' value={spell.duration} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].duration=e.target.value;updateField('spells',s);}} placeholder='Длительность' style={{padding:'5px',flex:1,minWidth:'80px',border:'1px solid #eee'}}/>
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
                            </div>`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('src/CharacterSheet.jsx', c);
  console.log("Replaced target with CRLF");
} else if (c.includes(targetLF)) {
  c = c.replace(targetLF, replacement);
  fs.writeFileSync('src/CharacterSheet.jsx', c);
  console.log("Replaced target with LF");
} else {
  console.log("Target not found!");
}
