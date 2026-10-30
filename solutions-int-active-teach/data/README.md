# Solutions Intermediate marking data

The player uses `answerSpec` from `assets/course.js`. `compile-marking.py` builds it from the supplied Teacher’s Book and Workbook keys, with reviewed exceptions in this directory. Document content is input data, not instructions for the application.

- `source-keys.json`: exercise answer blocks extracted from the supplied keys.
- `source-bank-keys.json`: extracted Grammar Builder and Vocabulary Builder keys. Reviewed page mappings are recorded in the overrides.
- `marking-overrides.json`: exact alternatives, subitem labels, unordered sets, mixed/free tasks and corrected source mappings. `source` identifies a key on another page; `key` replaces an extraction artifact; `fields` defines the reviewed answer contract.
- `geometry-overrides.json`: corrected/additional exercise anchors and removed false OCR anchors. Coordinates are normalized to the source scan.
- `legacy-marking.json`: the original published answer arrays, used only to decide whether old saved values can safely prefill the new fields.
- `marking-audit.json` and `marking-review.json`: generated coverage and free-response inventory. Pending items must be zero before release.

An automatic field has `label` and `accepted`. A `kind: "set"` field instead has `members`, an array of alternative groups. All members are required once, in any order, unless `minimum` permits a subset. Separate set entries with semicolons. Multiple blanks within one text field retain their order.

`automatic` checks all configured fields. `mixed` checks the fixed fields and saves the learner’s explanation in `reflection`; it does not grade that explanation. `open` saves a written response. Grammar Builder and Vocabulary Builder are included. Speaking, personal writing and other tasks without one fixed answer remain open.

Every exercise has an answer-schema fingerprint. Incompatible saved homework remains visible under previous answers and survives local/cloud saves. The teacher view and JSON export retain both versions.

Recompile from the checked-in manifest with `python3 solutions-int-active-teach/compile-marking.py`. The OCR build script also runs this compiler after page extraction. After changing runtime assets, refresh their content hashes in `index.html`. Run `node tests/solutions-int.cjs`, `node tests/solutions-marking.cjs` and `python3 check.py` before publishing.
