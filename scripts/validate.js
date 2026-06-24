#!/usr/bin/env node
/**
 * validate.js — Validates all module JSONs against the course schema
 * 
 * Usage: node scripts/validate.js [module-id]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'course-config.json');
const MODULES_DIR = path.join(ROOT, 'modules');

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

// Optional: validate single module
const targetModule = process.argv[2];

const SYNTAX_CLASSES = ['kw', 'type', 'str', 'num', 'cm', 'fn', 'op', 'dec', 'self', 'bi'];
const VALID_SECTION_TYPES = ['comparison', 'insight', 'concept-map', 'table', 'prose', 'quiz', 'diagram', 'animation', 'tab-group'];
const VALID_INSIGHT_VARIANTS = ['gotcha', 'win', ''];

let totalErrors = 0;
let totalWarnings = 0;

function log(level, modId, msg) {
  const icon = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
  console.log(`  ${icon} [${modId}] ${msg}`);
  if (level === 'error') totalErrors++;
  if (level === 'warn') totalWarnings++;
}

function checkSyntaxHighlighting(code, modId, secIdx, side) {
  if (!code) return;
  const hasSpans = code.includes('<span class=');
  if (!hasSpans) {
    log('warn', modId, `Section ${secIdx} (${side}): No syntax highlighting spans found`);
  }
}

function validateModule(modId) {
  const modPath = path.join(MODULES_DIR, `${modId}.json`);

  if (!fs.existsSync(modPath)) {
    log('error', modId, `Module file not found: ${modPath}`);
    return;
  }

  let mod;
  try {
    mod = JSON.parse(fs.readFileSync(modPath, 'utf-8'));
  } catch (err) {
    log('error', modId, `Invalid JSON: ${err.message}`);
    return;
  }

  // Schema validation
  if (!mod.id) log('error', modId, 'Missing "id" field');
  if (mod.id && mod.id !== modId) log('warn', modId, `id "${mod.id}" doesn't match filename "${modId}"`);
  if (!mod.title) log('error', modId, 'Missing "title" field');
  if (!mod.eyebrow) log('warn', modId, 'Missing "eyebrow" field');
  if (!mod.subtitle) log('warn', modId, 'Missing "subtitle" field');
  if (!Array.isArray(mod.sections)) {
    log('error', modId, 'Missing or invalid "sections" array');
    return;
  }

  if (mod.sections.length === 0) log('error', modId, 'Empty sections array');
  if (mod.sections.length > 10) log('warn', modId, `${mod.sections.length} sections — consider splitting`);

  const diagramIds = new Set();
  const animIds = new Set();
  let compCount = 0, quizCount = 0, insightCount = 0;

  mod.sections.forEach((sec, i) => {
    if (!VALID_SECTION_TYPES.includes(sec.type)) {
      log('error', modId, `Section ${i}: unknown type "${sec.type}"`);
      return;
    }

    switch (sec.type) {
      case 'comparison':
        compCount++;
        if (!sec.java) log('error', modId, `Section ${i}: comparison missing "java"`);
        if (!sec.python) log('error', modId, `Section ${i}: comparison missing "python"`);
        checkSyntaxHighlighting(sec.java, modId, i, 'java');
        checkSyntaxHighlighting(sec.python, modId, i, 'python');

        // Check rough balance
        if (sec.java && sec.python) {
          const jLines = sec.java.split('\n').length;
          const pLines = sec.python.split('\n').length;
          if (Math.abs(jLines - pLines) > 8) {
            log('warn', modId, `Section ${i}: comparison sides unbalanced (Java: ${jLines} lines, Python: ${pLines} lines)`);
          }
        }
        break;

      case 'insight':
        insightCount++;
        if (!sec.title) log('error', modId, `Section ${i}: insight missing "title"`);
        if (!sec.content) log('error', modId, `Section ${i}: insight missing "content"`);
        if (sec.variant !== undefined && !VALID_INSIGHT_VARIANTS.includes(sec.variant)) {
          log('warn', modId, `Section ${i}: insight variant "${sec.variant}" not recognized`);
        }
        break;

      case 'quiz':
        quizCount++;
        if (!sec.question) log('error', modId, `Section ${i}: quiz missing "question"`);
        if (!Array.isArray(sec.options)) log('error', modId, `Section ${i}: quiz missing "options" array`);
        else if (sec.options.length !== 4) log('error', modId, `Section ${i}: quiz needs exactly 4 options, got ${sec.options.length}`);
        if (sec.correct === undefined) log('error', modId, `Section ${i}: quiz missing "correct"`);
        else if (sec.correct < 0 || sec.correct > 3) log('error', modId, `Section ${i}: quiz "correct" ${sec.correct} out of range 0-3`);
        if (!sec.explanation) log('warn', modId, `Section ${i}: quiz missing "explanation"`);
        break;

      case 'table':
        if (!Array.isArray(sec.headers)) log('error', modId, `Section ${i}: table missing "headers"`);
        if (!Array.isArray(sec.rows)) log('error', modId, `Section ${i}: table missing "rows"`);
        if (sec.rows && sec.rows.length > 12) log('warn', modId, `Section ${i}: table has ${sec.rows.length} rows — consider trimming`);
        if (sec.headers && sec.rows) {
          sec.rows.forEach((row, ri) => {
            if (row.length !== sec.headers.length) {
              log('error', modId, `Section ${i}: table row ${ri} has ${row.length} cells, headers have ${sec.headers.length}`);
            }
          });
        }
        break;

      case 'concept-map':
        if (!sec.title) log('error', modId, `Section ${i}: concept-map missing "title"`);
        if (!sec.content) log('error', modId, `Section ${i}: concept-map missing "content"`);
        break;

      case 'diagram':
        if (sec.id) {
          if (diagramIds.has(sec.id)) log('error', modId, `Section ${i}: duplicate diagram id "${sec.id}"`);
          diagramIds.add(sec.id);
        }
        break;

      case 'animation':
        if (sec.id) {
          if (animIds.has(sec.id)) log('error', modId, `Section ${i}: duplicate animation id "${sec.id}"`);
          animIds.add(sec.id);
        }
        break;

      case 'tab-group':
        if (!Array.isArray(sec.tabs) || sec.tabs.length < 2) {
          log('error', modId, `Section ${i}: tab-group needs at least 2 tabs`);
        }
        if (sec.tabs && sec.tabs.length > 4) {
          log('warn', modId, `Section ${i}: tab-group has ${sec.tabs.length} tabs — consider 4 max`);
        }
        break;
    }
  });

  // Module-level quality checks (skip welcome module)
  if (!modId.startsWith('00')) {
    if (compCount === 0) log('warn', modId, 'No comparison sections — Java↔Python mapping is the core value');
    if (quizCount === 0) log('warn', modId, 'No quiz sections — add at least 1 knowledge check');
    if (quizCount > 2) log('warn', modId, `${quizCount} quizzes — consider max 2 per module`);
    if (insightCount === 0) log('warn', modId, 'No insight sections — add gotchas or wins');
  }
}

// ── RUN ──
console.log('\n🔍 Validating Python for Java Developers course...\n');

// Check config references
const moduleFiles = fs.readdirSync(MODULES_DIR).filter(f => f.endsWith('.json'));
const moduleIdsOnDisk = moduleFiles.map(f => f.replace('.json', ''));

config.moduleOrder.forEach(modId => {
  if (!moduleIdsOnDisk.includes(modId)) {
    console.log(`  ❌ [config] Module "${modId}" in config but no file on disk`);
    totalErrors++;
  }
});

moduleIdsOnDisk.forEach(modId => {
  if (!config.moduleOrder.includes(modId)) {
    console.log(`  ⚠️  [config] File "${modId}.json" on disk but not in config moduleOrder`);
    totalWarnings++;
  }
});

// Validate modules
const modsToValidate = targetModule ? [targetModule] : config.moduleOrder;
modsToValidate.forEach(modId => validateModule(modId));

// Summary
console.log(`\n${'─'.repeat(50)}`);
if (totalErrors === 0 && totalWarnings === 0) {
  console.log('✅ All modules valid!');
} else {
  console.log(`📊 Results: ${totalErrors} errors, ${totalWarnings} warnings`);
  if (totalErrors > 0) {
    console.log('   Fix errors before building.');
  }
}
console.log('');

process.exit(totalErrors > 0 ? 1 : 0);
