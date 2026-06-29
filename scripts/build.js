#!/usr/bin/env node
/**
 * build.js — Assembles module JSONs + shell template → single HTML course file
 * 
 * Usage: node scripts/build.js [--out <path>]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'course-config.json');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const MODULES_DIR = path.join(ROOT, 'modules');

// Parse CLI args — --out overrides the output root directory
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const OUTPUT_ROOT = outIdx !== -1 && args[outIdx + 1] ? args[outIdx + 1] : path.join(ROOT, 'output');

// Build targets: each shell template → its own deployable folder (S3-friendly index.html)
const TARGETS = [
  { name: 'desktop', shell: 'shell.html', dir: 'desktop' },
  { name: 'mobile', shell: 'shell-mobile.html', dir: 'mobile' },
];

function loadJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch (err) {
    console.error(`❌ Failed to load ${filepath}: ${err.message}`);
    process.exit(1);
  }
}

function validateModule(mod, filename) {
  const errors = [];

  if (!mod.id) errors.push('Missing "id"');
  if (!mod.title) errors.push('Missing "title"');
  if (!Array.isArray(mod.sections)) errors.push('Missing or invalid "sections" array');

  if (mod.sections) {
    const validTypes = ['comparison', 'insight', 'concept-map', 'table', 'prose', 'quiz', 'diagram', 'animation', 'tab-group'];

    mod.sections.forEach((sec, i) => {
      if (!validTypes.includes(sec.type)) {
        errors.push(`Section ${i}: unknown type "${sec.type}"`);
      }

      switch (sec.type) {
        case 'comparison':
          if (!sec.java) errors.push(`Section ${i}: comparison missing "java"`);
          if (!sec.python) errors.push(`Section ${i}: comparison missing "python"`);
          break;
        case 'insight':
          if (!sec.title) errors.push(`Section ${i}: insight missing "title"`);
          if (!sec.content) errors.push(`Section ${i}: insight missing "content"`);
          break;
        case 'quiz':
          if (!sec.question) errors.push(`Section ${i}: quiz missing "question"`);
          if (!Array.isArray(sec.options) || sec.options.length !== 4) errors.push(`Section ${i}: quiz needs exactly 4 options`);
          if (sec.correct === undefined || sec.correct < 0 || sec.correct > 3) errors.push(`Section ${i}: quiz "correct" must be 0-3`);
          if (!sec.explanation) errors.push(`Section ${i}: quiz missing "explanation"`);
          break;
        case 'table':
          if (!Array.isArray(sec.headers)) errors.push(`Section ${i}: table missing "headers"`);
          if (!Array.isArray(sec.rows)) errors.push(`Section ${i}: table missing "rows"`);
          break;
        case 'concept-map':
          if (!sec.title) errors.push(`Section ${i}: concept-map missing "title"`);
          if (!sec.content) errors.push(`Section ${i}: concept-map missing "content"`);
          break;
      }
    });

    // Check minimum content: at least 1 comparison or concept-map, 1 quiz
    const hasComparison = mod.sections.some(s => s.type === 'comparison' || s.type === 'concept-map');
    const hasQuiz = mod.sections.some(s => s.type === 'quiz');

    if (!mod.id.startsWith('00') && !hasComparison) {
      errors.push('Module should have at least 1 comparison or concept-map section');
    }
    if (!mod.id.startsWith('00') && !hasQuiz) {
      errors.push('Module should have at least 1 quiz section');
    }
  }

  if (errors.length > 0) {
    console.warn(`⚠️  ${filename}:`);
    errors.forEach(e => console.warn(`   • ${e}`));
  }

  return errors.length === 0;
}

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
  return (fs.statSync(filePath).size / 1024).toFixed(1);
}

function build() {
  console.log('🔨 Building Python for Java Developers course...\n');

  // 1. Load config
  const config = loadJSON(CONFIG_PATH);
  const title = config.title || 'Python for Java Developers';
  console.log(`📋 Config loaded: ${config.moduleOrder.length} modules defined`);

  // 2. Load and validate modules (once, shared by all targets)
  const modules = [];
  let allValid = true;

  config.moduleOrder.forEach(modId => {
    const modPath = path.join(MODULES_DIR, `${modId}.json`);
    if (!fs.existsSync(modPath)) {
      console.warn(`⚠️  Module file missing: ${modId}.json — skipping`);
      return;
    }
    const mod = loadJSON(modPath);
    if (!validateModule(mod, `${modId}.json`)) allValid = false;
    if (!mod.slug) mod.slug = modId.replace(/^\d+[-_]/, '');  // pretty deep-link slug from filename (00-welcome → welcome)
    modules.push(mod);
  });

  // slugs must be unique — they're used as URL fragments for deep-linking
  const slugs = modules.map(m => m.slug);
  if (new Set(slugs).size !== slugs.length) {
    console.error(`❌ Duplicate module slugs: ${slugs.filter((s, i) => slugs.indexOf(s) !== i).join(', ')}`);
    process.exit(1);
  }

  console.log(`✅ Loaded ${modules.length} / ${config.moduleOrder.length} modules\n`);

  if (modules.length === 0) {
    console.error('❌ No modules loaded. Nothing to build.');
    process.exit(1);
  }

  const modulesJson = JSON.stringify(modules, null, 2);
  const sidebarJson = JSON.stringify(config.sidebarGroups, null, 2);
  const sectionCount = modules.reduce((sum, m) => sum + m.sections.length, 0);

  // 3. Build each shell target into its own S3-deployable folder
  TARGETS.forEach(target => {
    const shellPath = path.join(TEMPLATES_DIR, target.shell);
    if (!fs.existsSync(shellPath)) {
      console.error(`❌ Shell template not found: ${shellPath}`);
      process.exit(1);
    }
    let shell = fs.readFileSync(shellPath, 'utf-8');
    shell = shell.replace('{{COURSE_TITLE}}', title);
    shell = shell.replace('{{MODULES_JSON}}', modulesJson);
    shell = shell.replace('{{SIDEBAR_GROUPS_JSON}}', sidebarJson);

    const outPath = path.join(OUTPUT_ROOT, target.dir, 'index.html');
    const sizeKB = writeFile(outPath, shell);
    console.log(`   🧩 ${target.name.padEnd(8)} → ${path.relative(ROOT, outPath)}  (${sizeKB} KB)`);
  });

  // 4. Build the landing page (S3 root index.html → links to both versions)
  const landingPath = path.join(TEMPLATES_DIR, 'landing.html');
  if (fs.existsSync(landingPath)) {
    let landing = fs.readFileSync(landingPath, 'utf-8');
    landing = landing.replace(/\{\{COURSE_TITLE\}\}/g, title);
    landing = landing.replace(/\{\{MODULE_COUNT\}\}/g, String(modules.length));
    landing = landing.replace(/\{\{SECTION_COUNT\}\}/g, String(sectionCount));
    const outPath = path.join(OUTPUT_ROOT, 'index.html');
    const sizeKB = writeFile(outPath, landing);
    console.log(`   🏠 landing  → ${path.relative(ROOT, outPath)}  (${sizeKB} KB)`);
  }

  console.log(`\n🎉 Built successfully!`);
  console.log(`   📁 ${OUTPUT_ROOT}`);
  console.log(`   📊 ${modules.length} modules | ${sectionCount} sections`);
  console.log(`\n   Deploy: aws s3 sync "${path.relative(ROOT, OUTPUT_ROOT)}" s3://your-bucket --delete`);

  if (!allValid) {
    console.log(`\n⚠️  Some modules had validation warnings. Run 'node scripts/validate.js' for details.`);
  }
}

build();
