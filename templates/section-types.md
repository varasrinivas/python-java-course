# Section Types Reference

Every module is a JSON file containing a `sections` array. Each section has a `type` field that determines its rendering. This document details every supported type with examples.

---

## 1. `comparison` — Side-by-Side Code

The core section type. Shows Java (left) and Python (right) in a split layout.

```json
{
  "type": "comparison",
  "java": "<span class=\"cm\">// Java code</span>\n<span class=\"kw\">public class</span> <span class=\"type\">Hello</span> {\n    ...\n}",
  "python": "<span class=\"cm\"># Python code</span>\n<span class=\"kw\">class</span> <span class=\"type\">Hello</span>:\n    ..."
}
```

**Syntax highlight spans:**
- `.kw` = keywords (class, def, if, for, import, return, public, private, static, void, new, this, extends, implements)
- `.type` = types (String, int, List, Optional, Map, custom class names)
- `.str` = string literals (wrap the entire string including quotes)
- `.num` = numbers
- `.cm` = comments (wrap the entire comment line)
- `.fn` = function/method names (just the name, not parens)
- `.op` = operators and f-string braces
- `.dec` = decorators (@property, @dataclass, @Override)
- `.self` = Python self parameter
- `.bi` = built-in functions (print, len, type, range)

**Rules:**
- Use `\n` for newlines in JSON strings
- Escape inner quotes: `\"` for HTML attributes inside span class
- Keep both sides within ±3 lines of each other when possible

---

## 2. `insight` — Callout Block

Highlighted text block with three variants:

```json
{
  "type": "insight",
  "variant": "gotcha",
  "title": "Mutable Default Arguments",
  "content": "Never use <code>def add(item, lst=[])</code>. The list is shared across ALL calls!"
}
```

**Variants:**
- `"gotcha"` — Yellow border, ⚠️ prefix. Use for Java-habits-that-break-in-Python.
- `"win"` — Green border, ✨ prefix. Use for Python-is-genuinely-better moments.
- `""` (empty string) — Purple/accent border. General observation or mental model shift.

---

## 3. `concept-map` — Visual Overview

Grid/flex layout showing concept relationships:

```json
{
  "type": "concept-map",
  "title": "Type System Comparison",
  "content": "<div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:16px;\">...</div>"
}
```

**Rules:**
- Use inline styles (this renders in a single-file HTML)
- Use `--java-*` and `--python-*` CSS variables for coloring
- Max 5 elements per map
- Use `border-radius: 8-10px` on all boxes

---

## 4. `table` — Reference Comparison

Structured mapping table:

```json
{
  "type": "table",
  "headers": ["Java", "Python", "Notes"],
  "rows": [
    ["<code>ArrayList</code>", "<code>list</code>", "Built-in, no import"],
    ["<code>HashMap</code>", "<code>dict</code>", "Literal syntax: {k: v}"]
  ]
}
```

**Rules:**
- `<code>` tags allowed in cells
- 6-10 rows maximum
- Headers typically contrast Java vs Python

---

## 5. `prose` — Explanatory Text

Narrative content:

```json
{
  "type": "prose",
  "content": "<p>Python files ARE modules. A file <code>utils.py</code> is directly importable.</p>"
}
```

**Rules:**
- Use `<p>` tags for paragraphs
- `<code>` for inline code references
- `<em>` for emphasis
- Keep under 3 paragraphs per section

---

## 6. `quiz` — Knowledge Check

End-of-module assessment:

```json
{
  "type": "quiz",
  "question": "What replaces Java's curly braces in Python?",
  "options": ["Parentheses ()", "Square brackets []", "Indentation", "Colons only"],
  "correct": 2,
  "explanation": "Python uses consistent indentation (typically 4 spaces) to define code blocks."
}
```

**Rules:**
- `correct` is 0-indexed
- Always 4 options
- `explanation` should reference Java→Python context
- 1-2 quizzes per module maximum

---

## 7. `diagram` — SVG Technical Diagram

Inline SVG for architecture/flow diagrams:

```json
{
  "type": "diagram",
  "id": "memory-model",
  "title": "Memory Model Comparison",
  "svg": "<svg viewBox=\"0 0 700 300\" ...>...</svg>"
}
```

**Rules:**
- viewBox max: 800x400
- Use CSS variable colors via inline style
- Font families must match design system
- Use `rx=\"10\"` on rects, dashed lines for connectors

---

## 8. `animation` — Interactive Visual

HTML/CSS/JS animation stage:

```json
{
  "type": "animation",
  "id": "gc-animation",
  "title": "Garbage Collection: Java vs Python",
  "description": "Shows reference counting vs generational GC",
  "html": "<div class=\"anim-stage\">...</div>"
}
```

**Rules:**
- Self-contained HTML/CSS/JS (no external deps)
- Include play/reset controls
- Use requestAnimationFrame for animations
- Keep under 100 lines of JS

---

## 9. `tab-group` — Tabbed Content

Multiple views in tabs:

```json
{
  "type": "tab-group",
  "tabs": [
    {"label": "Basic", "content": "<pre>basic example code</pre>"},
    {"label": "Advanced", "content": "<pre>advanced example code</pre>"},
    {"label": "Real-World", "content": "<pre>production pattern</pre>"}
  ]
}
```

**Rules:**
- 2-4 tabs maximum
- Labels should be short (1-2 words)
- Content can contain any HTML
