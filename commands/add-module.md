# /add-module <title> <after-module-id>

## Purpose
Add a brand new module to the course roster.

## Steps

1. **Determine** the next module number by looking at existing modules in `course-config.json`
2. **Generate** a module ID in format `NN-slug` (e.g., `13-async-await`)
3. **Update** `course-config.json`:
   - Add entry to `modules` object with title, eyebrow, subtitle, status: "scaffold"
   - Insert into `moduleOrder` array after the specified module
   - Add to appropriate `sidebarGroups` section
4. **Create** an empty scaffold JSON in `modules/`:
   ```json
   {
     "id": "13-async-await",
     "title": "Async & Concurrency",
     "eyebrow": "Module 13",
     "subtitle": "...",
     "sections": []
   }
   ```
5. **Inform** user to run `/gen-module <id>` to populate the content

## Example
```
/add-module "Async & Concurrency" 12-testing
```
