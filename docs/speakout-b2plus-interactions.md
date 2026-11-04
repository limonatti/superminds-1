# Speakout B2+ exercise input review

The same input policy covers all 721 Student’s Book and 393 Workbook exercises.
Free-entry tasks receive no grading answers in the word-bank presentation layer.
Only explicitly specified choices from the original task become selectable cards;
multiple-selection tasks retain their checkboxes. The original scanned instructions,
word boxes, sentence options and surrounding context remain visible.

Keys and model answers appear only after every original field has a non-empty,
submitted answer. This also applies to the Answers panel. Clearing or editing a
response locks its key again. Added notes and preserved legacy fields do not count
as required fields. This is a learning-flow rule, not a security boundary: the
public course still includes teacher resources and client-side grading data.

Exercise and account storage IDs are unchanged. When reviewed models retire an
incorrectly detected field, the existing answer renderer retains its saved value
as an extra field. The cloud store, ownership rules and offline queue are unchanged.

`scripts/data/b2plus-studentbook-review.json` records 15 targeted corrections with
their source rationale: detached section headings, complete original choice sets,
optional wording, and two keys formerly assigned to the wrong activity/column.
The generator applies these overrides without inventing new keys. Workbook’s
independently reviewed 1,681 checks and 61 open fields are unchanged; these are not
presented as an official Pearson answer key.

Speakout B2+ opts into source-width fitting, so long original tasks stay readable
instead of shrinking to the remaining dialog height. Zoom and scrolling remain
available. Enter moves to the next field and loads that field’s own current value.

Validation: all-exercise input-policy and attempt-gating checks; Workbook positive,
negative and accepted-form checks; account restore, merge, deletion markers,
offline retry and account-isolation tests; platform `check.py`. Browser checks
cover Unit 1 Review 2A (wrong form, correct forms, edit, Enter, key gating, reset,
reload), Grammar Bank page 123 (all A–C choices), Workbook page 4 (wrong/correct
answers), source zoom, and a 390 px viewport. Temporary local test answers cleared.
