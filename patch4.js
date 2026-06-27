import fs from 'fs';
let c = fs.readFileSync('src/CharacterSheet.jsx', 'utf8');

const startIndex = c.indexOf(`{spell.isCustom ? (`);
const durationIndex = c.indexOf(`<span>⏳ {spell.duration}</span>`);

if (startIndex !== -1 && durationIndex !== -1) {
  // Find the end of `</div>\n                            </div>` after durationIndex
  let endIndex = c.indexOf('</div>', durationIndex);
  endIndex = c.indexOf('</div>', endIndex + 6);
  endIndex += 6; // Include the closing tag

  const replacement = `{spell.isCustom ? (
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
                            
  c = c.substring(0, startIndex) + replacement + c.substring(endIndex);
  fs.writeFileSync('src/CharacterSheet.jsx', c);
  console.log("Successfully patched! Replaced chunk length:", endIndex - startIndex);
} else {
  console.log("Could not find start or end index.");
}
