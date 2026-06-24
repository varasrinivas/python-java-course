# /audit-course

## Purpose
Run comprehensive validation across all modules and report quality metrics.

## Steps

1. **Run** `node scripts/validate.js` for schema validation
2. **Check** each module for:
   - Missing syntax highlighting in comparison blocks
   - Unbalanced Java/Python code lengths (>5 line difference)
   - Quizzes without explanations
   - Duplicate diagram/animation IDs across modules
   - Modules in config missing files (and vice versa)
   - Modules exceeding 8 sections
   - Modules without minimum content (comparison + insight + quiz)
3. **Report** coverage stats:
   - Total modules / total sections
   - Section type distribution (how many comparisons, insights, quizzes, etc.)
   - Gotcha vs win insight ratio
   - Modules marked "scaffold" vs "complete"
4. **Suggest** improvements:
   - Modules lacking visual elements (diagrams, concept-maps, animations)
   - Modules with no gotcha insights
   - Large modules that could be split

## Example
```
/audit-course
```
