import fs from 'fs';
let c = fs.readFileSync('src/CharacterSheet.jsx', 'utf8');

// Fix 1: Remove duplicate AC line
const lines = c.split('\n');
const dupIdx = lines.findIndex(l => l.includes('baseAc = Math.max') && !l.includes('//'));
if (dupIdx !== -1) {
  lines.splice(dupIdx, 1);
  c = lines.join('\n');
  console.log("Removed duplicate AC line at", dupIdx + 1);
}

// Fix 2: Add level selector to custom spell
const target = `                                 </div>
                               ) : (`;
const replacement = `                                   <div style={{display:'flex',gap:'5px',alignItems:'center',flexWrap:'wrap'}}>
                                     <label style={{fontSize:'0.85rem',fontWeight:'bold',color:'#555'}}>Уровень:</label>
                                     <select value={spell.level} onChange={e=>{const s=[...character.spells];s[spell.originalIndex].level=parseInt(e.target.value);updateField('spells',s);}} style={{padding:'3px 5px',border:'1px solid #eee',borderRadius:'4px',fontSize:'0.85rem'}}>
                                       <option value={0}>Заговор (0)</option>
                                       {[1,2,3,4,5,6,7,8,9].map(n=><option key={n} value={n}>{n} уровень</option>)}
                                     </select>
                                   </div>
                                 </div>
                               ) : (`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  console.log("Added level selector to custom spell");
} else {
  console.log("Level selector target not found!");
}

fs.writeFileSync('src/CharacterSheet.jsx', c);
