import fs from 'fs';
let c = fs.readFileSync('src/CharacterSheet.jsx', 'utf8');

// Find the closing of the custom spell div and insert level selector before it
const durIdx = c.indexOf("placeholder='Длительность' style={{padding:'5px',flex:1,minWidth:'80px',border:'1px solid #eee', fontSize:'0.85rem'}}/>\\n                                  </div>\\n                                </div>\\n");

// Get actual string
const afterDur = c.indexOf("placeholder='Длительность'");
const closeDivIdx = c.indexOf('\n                                </div>\n', afterDur);

if (closeDivIdx !== -1) {
  const levelSelector = `
                                   <div style={{display:'flex',gap:'5px',alignItems:'center',flexWrap:'wrap'}}>
                                     <label style={{fontSize:'0.85rem',fontWeight:'bold',color:'#555'}}>Уровень:</label>
                                     <select value={spell.level} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].level=parseInt(e.target.value);updateField('spells',s);}} style={{padding:'3px 5px',border:'1px solid #eee',borderRadius:'4px',fontSize:'0.85rem'}}>
                                       <option value={0}>Заговор (0)</option>
                                       {[1,2,3,4,5,6,7,8,9].map(n=><option key={n} value={n}>{n} уровень</option>)}
                                     </select>
                                   </div>`;
  
  c = c.substring(0, closeDivIdx) + levelSelector + c.substring(closeDivIdx);
  fs.writeFileSync('src/CharacterSheet.jsx', c);
  console.log("Level selector added!");
} else {
  console.log("close div not found");
}
