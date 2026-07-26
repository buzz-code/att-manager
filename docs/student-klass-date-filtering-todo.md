# student_klasses start_date/end_date - report coverage tracker

Context: `student_klasses` gained optional `start_date`/`end_date` so a
student's klass assignment can be time-boxed. Business rule (confirmed):
**a student's BASE-type klass never changes for the whole year - only
speciality/maasit assignments can be switched mid-year** (enforced in
`switchKlass`, `student-klass.controller.js`). This file exists so a
future pass doesn't have to re-derive which reports were checked, why,
and what's still open. Route inventory pulled from `server/routes/*.route.js`.

## Done - NULL-safe active-range filtering applied

| Function | File | Notes |
|---|---|---|
| `findAll` (CRUD grid) | `student-klass.controller.js` | Via shared `date-before-or-null`/`date-after-or-null` operators in `common-modules` `applyFilters`. |
| `reportByKlassType` | `student-klass.controller.js` | `active_at` filter, defaults to today. |
| `getDiaryLessons` | `diary.controller.js` | |
| `getStudentLastAtt` | `diary.controller.js` | |
| `getStudentPresence` | `diary.controller.js` | |
| `getPivotData` | `diary.controller.js` | Also had to add the `student_klasses` join itself - wasn't there before. |
| `getDiaryInstancesQuery` (→ `getAllDiaryInstances`, `approveAllInstances`) | `diary.controller.js` | Absences list + bulk-approve. Had zero `student_klasses` join before. |
| `reportByDates` | `diary.controller.js` | Absences-by-klass-type report. Same gap as above. |
| `getDiaryLessonsTotal` | `diary.controller.js` | Also fixed a **real pre-existing bug** unrelated to dates: `qb.join('diaries')` had no `ON` condition -> unconditioned cross join, counted every lesson in the account against every student regardless of klass/group. Fixed by adding the proper `groups`/`klasses`/`student_klasses` join chain. |
| `getStudentsByUserIdAndKlassIdAndYear` (opening a new diary to fill in, and both diary + grade printing route through this) | `queryHelper.js` | Filters the roster to assignments active **as of today**. See caveat below - this is the one fix that's structurally imperfect. |

## Explicitly reviewed, not touched - needs a decision, not a bug

- **`report-edit.controller.js`** - the generic ad-hoc report builder. It exposes
  `student_klasses` as a joinable table for arbitrary user-defined reports
  (`tables`/`join` config, not a fixed query). There's no way to bake in
  date-awareness generically without knowing what the user is building.
  Decide: leave as-is (user's responsibility), or add an opt-in
  "active only" toggle to the report-builder UI.
- **`dashboard.controller.js` `getStats`** - the "students" count widget uses
  `getCountFromTable(StudentKlass, user_id, {year})`. Since speciality/maasit
  can now have multiple rows per student per year, check whether
  `getCountFromTable`'s distinct-by-field actually collapses that correctly
  (it's a shared `common-modules` utility) before trusting this number.

## Reviewed, not applicable

- **`att-report.controller.js`** - independent `att_reports` entity, doesn't
  join `student_klasses` at all.
- **`group.controller.js`** grade printing (`print-one-grade`,
  `print-all-grades`, `excel-one-grade`) - routes through
  `getGradeStreamByGroupId` -> `getDiaryDataByGroupId` ->
  `getStudentsByUserIdAndKlassIdAndYear`, same function already fixed above.
  No separate action needed, just noting it's covered indirectly.
- **`yemot.controller.js`** - phone/IVR integration, no `student_klasses`
  reference.
- **`student_base_klass`** join pattern (used loosely - by `student_tz`+`year`
  in some queries, by `student_tz` alone in others - throughout
  `diary.controller.js`) - **safe today only because base klass is
  immutable per the business rule above.** If that rule is ever relaxed
  (a base klass becomes switchable), every one of these joins needs to
  become date-aware too, or a student with 2+ base-klass periods in a year
  will get double-counted in `getDiaryLessons`, `getDiaryLessonsTotal`,
  `getStudentLastAtt`, `getStudentPresence`, `reportByDates`,
  `getAllDiaryInstances`, and the `getPivotData` student list. Reproduced
  this empirically in testing (a student with 2 same-type periods showed
  2x the correct lesson count) before the business rule was confirmed.
  **Do not relax the base-klass-is-fixed rule without redoing this.**

## Known imperfect fix - revisit if it becomes a real complaint

`getStudentsByUserIdAndKlassIdAndYear` filters to "active as of today"
because lesson dates aren't chosen until *after* the roster is fetched
(days are template slots at that point, not real dates) - there's no
single lesson_date to filter against yet, unlike the read-only reports
above. Consequence: reprinting or refilling an *old* diary reflects
*today's* active roster, not the historical one at the time. If a manager
ever needs to reprint a diary from months ago and get the roster as it
was back then, this needs a real fix (e.g. pass the diary's own date
range into the roster query instead of "today").
