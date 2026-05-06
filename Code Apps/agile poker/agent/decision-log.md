# Agile Poker App Decision Log

## Custom Requirements
- Visual direction: industrial scorewall with warm paper cards, charcoal framing, signal red accents, condensed display typography, and tactile board-game styling.
- App name: Agile Poker Scoring.
- Core flow: landing page joins or creates a session, then moves users into the live round view with shared vote state.
- Revised mockup direction: closer to the cleaner feel of mockup 5, but with no rounded corners, fewer card-like player blocks, a very simple landing screen, and a distinct dedicated round screen.
- New mockups should be highly varied and intentionally different from each other rather than small style adjustments.

## TODO
- [x] Confirm or choose visual theme/colours.
- [x] Offer mockups.
- [x] Create mockups if requested.
- [x] Review selected mockup feedback.
- [x] Create second mockup round if requested.
- [x] Implement the selected mockup in dist/.
- [x] Wire Dataverse session and round CRUD.
- [x] Add live polling for round state and score reveal.
- [x] Add previous/next navigation to mockups 6-10.
- [ ] Validate the app shell after implementation.

## Decisions
- Use Dataverse tables already registered in power.config.json: wd_agilepokersessionses, wd_agilepokerroundses, and systemusers.
- Use createdby and createdbyname from round records to identify and display players without a separate membership table.
- Save the special '?' vote as -9 and exclude it from average and mode calculations.
- Poll the round table by session and round so all clients converge on the same reveal state.
- Keep future round-screen concepts more list-, ledger-, or board-oriented instead of repeating many individual vote cards.
- Separate the landing interaction from the round view in the mockups so the navigation transition is explicit.
- The Code App runtime exports CRUD helpers as createItem/listItems/updateItem, not createRecord/getRecords/updateRecord, and whoAmI resolves to a user id value that must be normalized before owner checks.
- The current Dataverse schema uses wd_session for sessions and wd_round/wd_points for rounds; dist/index.js must use those field names instead of wd_name/wd_roundnumber/wd_score.
- dist/index.js now centralizes the session and round field names in constants copied from the agent schema files so future join/vote changes do not reintroduce guessed Dataverse column names.
- dist/index.html now requests index.js with a version query string to reduce stale-script issues in the Code Apps host after field-name fixes.
- The session row is now the source of truth for the active round via wd_round, with a one-time fallback that backfills wd_round from existing round rows for older sessions.
- Each user now creates or reuses a round row on join and at new-round start so they appear to other participants before casting a vote.
- Round setup is now awaited end-to-end so join/setup failures surface on the main path instead of being lost in fire-and-forget async work.
- Unrevealed player nodes now distinguish pending from submitted votes, the HUD shows vote-collection status instead of a constant syncing label, and the owner can end the round manually or by all votes being submitted.
- The round screen now includes a share button that copies the current join URL with the session query parameter.
- Current-user resolution is now enforced before any `_createdby_value` filter is built so round-participant lookups cannot emit an empty OData predicate.
- In this host, `whoAmI()` returns an app/user envelope with Azure AD identity (`user.objectId`, `user.userPrincipalName`) rather than `systemuserid`, so dist/index.js now resolves `systemusers.systemuserid` through the registered `users` table before any Dataverse `createdby` comparisons.
- The runtime expects the actual system user entity name rather than the old `users` alias on the identity path, so dist/index.js now targets `systemusers` and first probes `getItem(...)` with GUIDs already present in `whoAmI()` before falling back to filtered lookup.
- Non-owner clients now poll the session row for `wd_round` changes and rerun round setup when the owner starts a new round, so the next-round screen is driven from shared session state rather than only the owner's local state.
- Share links now use the Power Apps play URL shape with environment id, app id, tenant id, and the session query parameter instead of copying the raw current window URL.
- Clicking the HUD now toggles a round-history drawer that aggregates session rounds with average, mode, and submitted-vote count.
- The clickable HUD must explicitly override the shared button text color so the live session/round/status label stays visible while still acting as the history toggle.
- Session startup now reads the `session` query parameter from the Power Apps host context first, then from the browser URL, so shared play links behave the same as typing the session name and pressing Connect.
- Mockups 6-10 now form a continuous navigation sequence, with mockup 10 wrapping forward to mockup 1 so each file in that range has both previous and next links.

## Constraints
- Do not modify dist/codeapp.js; import its helpers from dist/index.js.
- Keep the implementation in dist/index.html and dist/index.js.
- Mockups in agent/ must be standalone HTML files with inline CSS and lightweight JavaScript.

## File Updates
- agent/decision-log.md: +29 / -0
- agent/mockup-1.html through agent/mockup-5.html: created in first mockup round.
- dist/index.js: patched SDK imports, CRUD calls, user-id normalization, and Dataverse field names to remove the browser module error and align with the registered schema.
- dist/index.js: now persists the current round to the session row, backfills legacy sessions missing wd_round, and creates participant round rows on join/new-round setup.
- dist/index.js: now awaits round setup on join, auto-reveals when all current participant rows have scores, shows pending vs locked player state, updates HUD status text, and adds clipboard sharing.
- dist/index.js: now re-resolves the Power Apps user id before current-user round lookups and throws a clear context error instead of sending `_createdby_value eq` with no value.
- dist/index.js: now maps the host identity from `whoAmI()` to Dataverse `systemuserid` using `users.azureactivedirectoryobjectid` with `domainname` as fallback.
- dist/index.js: now resolves host identity against `systemusers` and attempts direct single-record lookup with known GUID candidates before filtered fallback.
- dist/index.js: now refreshes the session round during polling and transitions other users into the new round when `wd_round` increases.
- dist/index.js: now builds Power Apps share URLs from host/config metadata and renders aggregated round history on HUD toggle.
- dist/index.html: now includes the HUD drawer container and styles for the round-history list.
- dist/index.html: now restores visible HUD label text by overriding the clickable HUD button color.
- dist/index.js: now resolves the startup session name from Power Apps host query params as well as `window.location.search` before running the normal join flow.
- dist/index.html: bumped the index.js cache-busting query string so the host fetches the session-param startup fix.
- dist/index.html: fixed the landing screen so its .box no longer remains visible after the round screen activates, and added a share button plus explicit round action button styles.
- dist/index.html: added a cache-busting index.js query string so the host fetches the updated script after schema fixes.
- agent/mockup-6.html: +8 / -1 to add previous/next navigation styling and links.
- agent/mockup-7.html: +2 / -2 to correct the previous/next navigation targets.
- agent/mockup-8.html: +8 / -0 to add previous/next navigation styling and links.
- agent/mockup-9.html: +8 / -0 to add previous/next navigation styling and links.
- agent/mockup-10.html: +8 / -0 to add previous/next navigation styling and links.