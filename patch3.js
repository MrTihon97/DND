import fs from 'fs';
let c = fs.readFileSync('src/CharacterSheet.jsx', 'utf8');

// Find the index of `{spell.isCustom ? (` and the end index of `<span>⏳ {spell.duration}</span>\r\n                              </div>\r\n                            </div>`
// or LF version.

const startIndex = c.indexOf(`{spell.isCustom ? (`);
const endIndex1 = c.indexOf(`<span>⏳ {spell.duration}</span>\r\n                              </div>\r\n                            </div>`);
const endIndex2 = c.indexOf(`<span>⏳ {spell.duration}</span>\n                              </div>\n                            </div>`);

const endIndexStr = endIndex1 !== -1 ? `<span>⏳ {spell.duration}</span>\r\n                              </div>\r\n                            </div>` : `<span>⏳ {spell.duration}</span>\n                              </div>\n                            </div>`;
const endIndex = endIndex1 !== -1 ? endIndex1 : endIndex2;

if (startIndex !== -1 && endIndex !== -1) {
  const originalChunk = c.substring(startIndex, endIndex + endIndexStr.length);
  
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
                            
  c = c.substring(0, startIndex) + replacement + c.substring(endIndex + endIndexStr.length);
  fs.writeFileSync('src/CharacterSheet.jsx', c);
  console.log("Successfully patched!");
} else {
  console.log("Could not find start or end index.", "start:", startIndex, "end1:", endIndex1, "end2:", endIndex2);
}
