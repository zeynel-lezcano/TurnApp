import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const root = process.cwd();
const ymlPath = path.join(root, 'docs/backlog.yaml');
const mdPath  = path.join(root, 'docs/TODO.md');

const src = fs.readFileSync(ymlPath, 'utf8');
const yml = yaml.parse(src);

// defensive defaults
yml.now   = Array.isArray(yml.now)   ? yml.now   : [];
yml.next  = Array.isArray(yml.next)  ? yml.next  : [];
yml.later = Array.isArray(yml.later) ? yml.later : [];
yml.done  = Array.isArray(yml.done)  ? yml.done  : [];

const today = new Date().toISOString().slice(0,10);

function parseDoneFromMD(md) {
  const done = [];
  const re = /^- \[x\] (.+?) \(id: ([^)]+)\)/gm;
  let m;
  while ((m = re.exec(md))) done.push(m[2]);
  return new Set(done);
}

let prevMD = fs.existsSync(mdPath) ? fs.readFileSync(mdPath,'utf8') : '';
const checked = parseDoneFromMD(prevMD);

// move checked from now/next/later -> done
['now','next','later'].forEach(lane=>{
  yml[lane] = yml[lane].filter(t=>{
    if (checked.has(t.id)) { yml.done.push({...t, doneAt: today}); return false; }
    return true;
  });
});

// pull from next -> now bis WIP-Limit
while (yml.now.length < (yml.wip_limit_now || 5) && yml.next.length) {
  yml.now.push(yml.next.shift());
}

// render MD
const section = (title, items, check=false) => [
  `## ${title}`,
  ...items.map(t => `- [${check?'x':' '}] ${t.title} (id: ${t.id}) — ${t.desc}`)
].join('\n');

const md = `# Aktuelle ToDos

> Quelle: docs/backlog.yaml (auto-generiert)

${section('NOW', yml.now)}
\n
${section('NEXT', yml.next)}
\n
${section('LATER', yml.later)}
\n
${section('DONE', yml.done, true)}
`;

fs.writeFileSync(mdPath, md);
fs.writeFileSync(ymlPath, yaml.stringify(yml));
console.log('TODO.md & backlog.yaml aktualisiert');
