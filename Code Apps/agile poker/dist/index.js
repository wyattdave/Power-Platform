import {
    createItem,
    getItem,
    listItems,
    registerTable,
    updateItem,
    whoAmI
} from './codeapp.js';



const TABLES = {
    sessions: {
        name: 'wd_agilepokersessionses',
        primaryKey: 'wd_agilepokersessionsid',
        fields: {
            name: 'wd_session',
            round: 'wd_round',
            createdBy: '_createdby_value'
        }
    },
    rounds: {
        name: 'wd_agilepokerroundses',
        primaryKey: 'wd_agilepokerroundsid',
        fields: {
            points: 'wd_points',
            round: 'wd_round',
            sessionLookup: '_wd_session_value',
            sessionBind: 'wd_Session@odata.bind',
            createdBy: '_createdby_value',
            createdByFormatted: '_createdby_value@OData.Community.Display.V1.FormattedValue'
        }
    },
    users: {
        name: 'systemusers',
        primaryKey: 'systemuserid',
        fields: {
            id: 'systemuserid',
            aadObjectId: 'azureactivedirectoryobjectid',
            domainName: 'domainname',
            fullName: 'fullname'
        }
    }
};

const SCORE = {
    question: -9,
    reveal: -999
};

const POWER_APP = {
    appId: '14370ab2-36d5-4b56-bfd3-4903f6f3cc2b',
    environmentId: 'default-6b6c3ede-aa0d-4268-a46f-96b7621b13a8',
    tenantId: '6b6c3ede-aa0d-4268-a46f-96b7621b13a8'
};

registerTable(TABLES.sessions.name, TABLES.sessions.primaryKey);
registerTable(TABLES.rounds.name, TABLES.rounds.primaryKey);
registerTable(TABLES.users.name, TABLES.users.primaryKey);



const els = {
    landing: document.getElementById('landing'),
    landingBox: document.getElementById('landing-box'),
    round: document.getElementById('round'),
    sessionInput: document.getElementById('session-input'),
    connectBtn: document.getElementById('connect-btn'),
    hudDisplay: document.getElementById('hud-display'),
    hudPanel: document.getElementById('hud-panel'),
    hudRounds: document.getElementById('hud-rounds'),
    shareBtn: document.getElementById('share-btn'),
    nodesContainer: document.getElementById('nodes-container'),
    revealBtn: document.getElementById('reveal-btn'),
    nextRoundBtn: document.getElementById('next-round-btn'),
    voteBtns: document.querySelectorAll('.vote-btn'),
    statsPanel: document.getElementById('stats-panel'),
    statAvg: document.getElementById('stat-avg'),
    statMode: document.getElementById('stat-mode'),
    toast: document.getElementById('toast'),
    votingPanel: document.getElementById('voting-panel')
};

let state = {
    userId: null,
    hostUser: null,
    sessionId: null,
    sessionName: null,
    sessionOwnerId: null,
    roundNumber: 1,
    roundId: null,
    players: new Map(), // map of userId -> vote record
    isRevealed: false,
    allSubmitted: false,
    statusText: 'SYNCING...',
    historyOpen: false,
    myVote: null,
    pollingInterval: null,
    revealSignalPending: false
};

async function boot() {
    try {
        state.userId = await resolveUserId();
        console.log('Logged in as:', state.userId);

        els.connectBtn.addEventListener('click', joinSession);
        els.sessionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') joinSession();
        });

        const requestedSessionName = getRequestedSessionName();
        if (requestedSessionName) {
            els.sessionInput.value = requestedSessionName;
            await joinSession();
        }
        
        els.voteBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const val = parseInt(e.target.dataset.val, 10);
                await castVote(val);
                els.voteBtns.forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
        
        els.revealBtn.addEventListener('click', forceReveal);
        els.nextRoundBtn.addEventListener('click', startNextRound);
        els.shareBtn.addEventListener('click', shareSession);
        els.hudDisplay.addEventListener('click', toggleRoundHistory);
        
    } catch (err) {
        showToast("Boot Error: " + err.message);
    }
}

async function joinSession() {
    const name = els.sessionInput.value.trim();
    if (!name) return;
    
    els.connectBtn.disabled = true;
    els.connectBtn.innerText = "CONNECTING...";
    
    try {
        await resolveUserId();
        const sessionFilterName = escapeODataString(name);
        const res = await listItems(TABLES.sessions.name, TABLES.sessions.primaryKey, {
            filter: `${TABLES.sessions.fields.name} eq '${sessionFilterName}'`,
            top: 1
        });
        const sessions = res?.entities || [];
        
        if (sessions.length > 0) {
            const session = sessions[0];
            state.sessionId = normalizeGuid(session.wd_agilepokersessionsid);
            state.sessionName = session[TABLES.sessions.fields.name];
            state.sessionOwnerId = normalizeGuid(session[TABLES.sessions.fields.createdBy]);
            state.roundNumber = await resolveCurrentRoundNumber(session);
        } else {
            const creation = await createItem(TABLES.sessions.name, TABLES.sessions.primaryKey, {
                [TABLES.sessions.fields.name]: name,
                [TABLES.sessions.fields.round]: '1'
            });
            state.sessionId = getEntityId(creation, TABLES.sessions.primaryKey);
            if (!state.sessionId) {
                const refresh = await listItems(TABLES.sessions.name, TABLES.sessions.primaryKey, {
                    filter: `${TABLES.sessions.fields.name} eq '${sessionFilterName}'`,
                    orderBy: 'createdon desc',
                    top: 1
                });
                state.sessionId = getEntityId(refresh?.entities?.[0], TABLES.sessions.primaryKey);
            }
            state.sessionName = name;
            state.sessionOwnerId = state.userId;
            state.roundNumber = 1;
        }
        
        // Update URL
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('session', state.sessionName);
        window.history.pushState({}, '', newUrl);
        
        showToast("Connected to " + state.sessionName);
        await transitionToRound();
        
    } catch (err) {
        showToast("Error joining: " + err.message);
        els.connectBtn.disabled = false;
        els.connectBtn.innerText = "CONNECT";
    }
}

function normalizeGuid(value) {
    return String(value || '').replace(/[{}]/g, '');
}

function getRequestedSessionName() {
    const hostSessionName = state.hostUser?.app?.queryParams?.session;
    const windowSessionName = new URLSearchParams(window.location.search).get('session');
    const candidates = [hostSessionName, windowSessionName];

    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
            return candidate.trim();
        }
    }

    return '';
}

function normalizeUserId(userInfo) {
    if (typeof userInfo === 'string') {
        return normalizeGuid(userInfo);
    }
    if (userInfo && typeof userInfo === 'object') {
        return normalizeGuid(
            userInfo.UserId ||
            userInfo.userId ||
            userInfo.systemuserid ||
            userInfo.user?.systemuserid ||
            userInfo.userSettings?.userId ||
            userInfo.context?.userId
        );
    }
    return '';
}

function isGuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ''));
}

async function findSystemUserId(filter) {
    const res = await listItems(TABLES.users.name, TABLES.users.primaryKey, {
        filter,
        top: 1
    });
    const users = res?.entities || [];
    if (users.length === 0) {
        return '';
    }
    return normalizeGuid(users[0][TABLES.users.fields.id]);
}

async function tryGetSystemUser(id) {
    if (!isGuid(id)) {
        return '';
    }

    try {
        const user = await getItem(
            TABLES.users.name,
            TABLES.users.primaryKey,
            id,
            [TABLES.users.fields.id]
        );
        return normalizeGuid(user?.[TABLES.users.fields.id]);
    } catch {
        return '';
    }
}

async function resolveUserId(forceRefresh = false) {
    if (!forceRefresh && state.userId) {
        return state.userId;
    }

    const whoAmIResult = await whoAmI();
    state.hostUser = whoAmIResult;

    const directUserId = normalizeUserId(whoAmIResult);
    const aadObjectId = normalizeGuid(whoAmIResult?.user?.objectId);
    const hintId = normalizeGuid(whoAmIResult?.app?.queryParams?.hint);
    const userPrincipalName = whoAmIResult?.user?.userPrincipalName?.trim() || '';

    let resolvedUserId = '';
    const directCandidates = [directUserId, aadObjectId, hintId].filter((value, index, array) => value && array.indexOf(value) === index);

    for (const candidateId of directCandidates) {
        resolvedUserId = await tryGetSystemUser(candidateId);
        if (resolvedUserId) {
            break;
        }
    }

    if (!resolvedUserId && aadObjectId) {
        resolvedUserId = await findSystemUserId(`${TABLES.users.fields.aadObjectId} eq ${aadObjectId}`);
    }
    if (!resolvedUserId && userPrincipalName) {
        const escapedUserPrincipalName = escapeODataString(userPrincipalName);
        resolvedUserId = await findSystemUserId(`${TABLES.users.fields.domainName} eq '${escapedUserPrincipalName}'`);
    }

    if (!resolvedUserId) {
        throw new Error('Could not resolve current user id from Power Apps context.');
    }

    state.userId = resolvedUserId;
    return state.userId;
}

function escapeODataString(value) {
    return String(value || '').replace(/'/g, "''");
}

function extractId(value) {
    if (!value || typeof value !== 'string') {
        return null;
    }
    const match = value.match(/\(([0-9a-fA-F-]{36})\)/);
    return match ? match[1] : normalizeGuid(value);
}

function getEntityId(record, primaryKey) {
    if (!record) {
        return null;
    }
    if (typeof record === 'string') {
        return extractId(record);
    }
    return normalizeGuid(
        record[primaryKey] ||
        record.id ||
        record['@odata.id'] ||
        record.odataEntityId
    );
}

function getSessionRoundNumber(session) {
    const rawRound = session?.[TABLES.sessions.fields.round];
    const parsedRound = Number.parseInt(rawRound, 10);
    return Number.isFinite(parsedRound) && parsedRound > 0 ? parsedRound : 1;
}

async function resolveCurrentRoundNumber(session) {
    const sessionRound = getSessionRoundNumber(session);
    if (session?.[TABLES.sessions.fields.round]) {
        return sessionRound;
    }

    const roundsRes = await listItems(TABLES.rounds.name, TABLES.rounds.primaryKey, {
        filter: `${TABLES.rounds.fields.sessionLookup} eq ${state.sessionId}`,
        orderBy: `${TABLES.rounds.fields.round} desc`,
        top: 1
    });
    const rounds = roundsRes?.entities || [];
    const derivedRound = rounds.length > 0 ? Number.parseInt(rounds[0][TABLES.rounds.fields.round], 10) || 1 : 1;

    await updateItem(TABLES.sessions.name, TABLES.sessions.primaryKey, state.sessionId, {
        [TABLES.sessions.fields.round]: String(derivedRound)
    });

    return derivedRound;
}

async function transitionToRound() {
    els.landing.classList.remove('active');
    els.round.classList.add('active');
    els.connectBtn.disabled = false;
    els.connectBtn.innerText = 'CONNECT';
    closeRoundHistory();
    await setupRound();
}

async function setupRound() {
    state.isRevealed = false;
    state.allSubmitted = false;
    state.statusText = 'JOINING ROUND';
    state.myVote = null;
    state.roundId = null;
    state.revealSignalPending = false;
    state.historyOpen = false;
    els.voteBtns.forEach(b => b.classList.remove('selected'));
    els.statsPanel.style.display = 'none';
    els.votingPanel.style.display = 'block';
    els.nextRoundBtn.style.display = 'none';
    closeRoundHistory();
    
    // Check if I am owner
    const amIOwner = String(state.sessionOwnerId).toLowerCase() === String(state.userId).toLowerCase();
    els.revealBtn.style.display = amIOwner ? 'block' : 'none';
    els.revealBtn.textContent = 'END ROUND';
    
    updateHud();
    renderNodes();

    await ensureCurrentUserRoundRecord();
    
    if (state.pollingInterval) clearInterval(state.pollingInterval);
    state.pollingInterval = setInterval(pollRound, 3000);
    await pollRound(); // immediate run
}

async function ensureCurrentUserRoundRecord() {
    const currentUserId = await resolveUserId();
    const res = await listItems(TABLES.rounds.name, TABLES.rounds.primaryKey, {
        filter: `${TABLES.rounds.fields.sessionLookup} eq ${state.sessionId} and ${TABLES.rounds.fields.round} eq ${state.roundNumber} and ${TABLES.rounds.fields.createdBy} eq ${currentUserId}`,
        top: 1
    });
    const existingRecords = res?.entities || [];

    if (existingRecords.length > 0) {
        const currentRecord = existingRecords[0];
        state.roundId = getEntityId(currentRecord, TABLES.rounds.primaryKey);
        state.myVote = currentRecord[TABLES.rounds.fields.points] ?? null;
        syncSelectedVoteButton();
        return currentRecord;
    }

    const creation = await createItem(TABLES.rounds.name, TABLES.rounds.primaryKey, {
        [TABLES.rounds.fields.round]: state.roundNumber,
        [TABLES.rounds.fields.sessionBind]: `/wd_agilepokersessionses(${state.sessionId})`
    });
    state.roundId = getEntityId(creation, TABLES.rounds.primaryKey);
    if (!state.roundId) {
        const refresh = await listItems(TABLES.rounds.name, TABLES.rounds.primaryKey, {
            filter: `${TABLES.rounds.fields.sessionLookup} eq ${state.sessionId} and ${TABLES.rounds.fields.round} eq ${state.roundNumber} and ${TABLES.rounds.fields.createdBy} eq ${currentUserId}`,
            orderBy: 'createdon desc',
            top: 1
        });
        state.roundId = getEntityId(refresh?.entities?.[0], TABLES.rounds.primaryKey);
    }
    state.myVote = null;
    syncSelectedVoteButton();
    return creation;
}

function syncSelectedVoteButton() {
    els.voteBtns.forEach((button) => {
        const buttonValue = Number.parseInt(button.dataset.val, 10);
        button.classList.toggle('selected', buttonValue === state.myVote);
    });
}

async function castVote(score) {
    try {
        await ensureCurrentUserRoundRecord();
        if (state.roundId) {
            await updateItem(TABLES.rounds.name, TABLES.rounds.primaryKey, state.roundId, {
                [TABLES.rounds.fields.points]: score
            });
            state.myVote = score;
        } else {
            const creation = await createItem(TABLES.rounds.name, TABLES.rounds.primaryKey, {
                [TABLES.rounds.fields.points]: score,
                [TABLES.rounds.fields.round]: state.roundNumber,
                [TABLES.rounds.fields.sessionBind]: `/wd_agilepokersessionses(${state.sessionId})`
            });
            state.roundId = getEntityId(creation, TABLES.rounds.primaryKey);
            state.myVote = score;
        }
        showToast("Vote registered.");
        await pollRound(); // refresh
    } catch (err) {
        showToast("Scoring failed.");
        console.error(err);
    }
}

async function forceReveal() {
    try {
        const amIOwner = String(state.sessionOwnerId).toLowerCase() === String(state.userId).toLowerCase();
        if (!amIOwner) return;
        if (state.revealSignalPending) return;
        state.revealSignalPending = true;
        
        await createItem(TABLES.rounds.name, TABLES.rounds.primaryKey, {
            [TABLES.rounds.fields.points]: SCORE.reveal,
            [TABLES.rounds.fields.round]: state.roundNumber,
            [TABLES.rounds.fields.sessionBind]: `/wd_agilepokersessionses(${state.sessionId})`
        });
        showToast("Revealing...");
        await pollRound();
    } catch (e) {
        console.error(e);
    } finally {
        state.revealSignalPending = false;
    }
}

async function startNextRound() {
    const nextRound = state.roundNumber + 1;
    await updateItem(TABLES.sessions.name, TABLES.sessions.primaryKey, state.sessionId, {
        [TABLES.sessions.fields.round]: String(nextRound)
    });
    state.roundNumber = nextRound;
    els.nextRoundBtn.style.display = 'none';
    await setupRound();
}

async function refreshSessionRoundState() {
    const sessionsRes = await listItems(TABLES.sessions.name, TABLES.sessions.primaryKey, {
        filter: `${TABLES.sessions.primaryKey} eq ${state.sessionId}`,
        top: 1
    });
    const session = sessionsRes?.entities?.[0];
    if (!session) {
        return false;
    }

    const latestRound = getSessionRoundNumber(session);
    if (latestRound <= state.roundNumber) {
        return false;
    }

    state.roundNumber = latestRound;
    showToast(`Round ${latestRound} started.`);
    await setupRound();
    return true;
}

async function pollRound() {
    if (!state.sessionId) return;
    try {
        const movedToNewRound = await refreshSessionRoundState();
        if (movedToNewRound) {
            return;
        }

        const res = await listItems(TABLES.rounds.name, TABLES.rounds.primaryKey, {
            filter: `${TABLES.rounds.fields.sessionLookup} eq ${state.sessionId} and ${TABLES.rounds.fields.round} eq ${state.roundNumber}`
        });
        const roundItems = res?.entities || [];
        
        let ownerRevealed = false;
        const votes = [];
        
        const newPlayers = new Map();
        
        roundItems.forEach((record) => {
            if (record[TABLES.rounds.fields.points] === SCORE.reveal) {
                ownerRevealed = true;
                return;
            }
            
            const userId = normalizeGuid(record[TABLES.rounds.fields.createdBy]);
            if (!userId) {
                return;
            }
            let userName = 'Unknown';
            if (record[TABLES.rounds.fields.createdByFormatted]) {
                userName = record[TABLES.rounds.fields.createdByFormatted];
            } else if (userId) {
                userName = userId.substring(0, 6);
            }
            const score = record[TABLES.rounds.fields.points];
            const hasSubmitted = score !== null && score !== undefined;
                             
            newPlayers.set(userId, {
                id: userId,
                name: userName,
                score,
                hasSubmitted,
                isCurrentUser: userId === state.userId
            });
            if (hasSubmitted) {
                votes.push(score);
            }
        });
        
        state.players = newPlayers;
        state.allSubmitted = newPlayers.size > 0 && Array.from(newPlayers.values()).every((player) => player.hasSubmitted);
        const amIOwner = String(state.sessionOwnerId).toLowerCase() === String(state.userId).toLowerCase();

        if (state.allSubmitted && !ownerRevealed && amIOwner) {
            await forceReveal();
            return;
        }

        state.isRevealed = ownerRevealed || state.allSubmitted;
        state.statusText = getRoundStatusText();
        
        if (state.isRevealed) {
            els.votingPanel.style.display = 'none';
            els.revealBtn.style.display = 'none';
            els.nextRoundBtn.style.display = amIOwner ? 'block' : 'none';
            calculateStats(votes);
        } else {
            els.votingPanel.style.display = 'block';
            els.revealBtn.style.display = amIOwner ? 'block' : 'none';
            els.nextRoundBtn.style.display = 'none';
            els.statsPanel.style.display = 'none';
        }
        
        renderNodes();
        updateHud();
        if (state.historyOpen) {
            await renderRoundHistory();
        }
        
    } catch (err) {
        console.error("Polling error:", err);
    }
}

function renderNodes() {
    const existing = document.querySelectorAll('.node');
    existing.forEach(e => e.remove());
    
    // Sort so it's consistent
    const pArr = Array.from(state.players.values()).sort((a,b) => a.name.localeCompare(b.name));
    const len = pArr.length;
    
    pArr.forEach((p, idx) => {
        let angle = (2 * Math.PI / len) * idx - (Math.PI / 2); 
        if (len === 0) angle = 0;
        
        const centerOffset = 300;
        const r = centerOffset - 60; // place slightly inside the boundary
        const x = centerOffset + r * Math.cos(angle);
        const y = centerOffset + r * Math.sin(angle);
        
        const el = document.createElement('div');
        el.className = 'node';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'node-name';
        nameDiv.innerText = p.name;
        
        const statusDiv = document.createElement('div');
        statusDiv.className = 'node-status';
        
        if (state.isRevealed) {
            el.classList.add('revealed');
            statusDiv.innerText = p.score === -9 ? '?' : p.score;
            statusDiv.style.fontSize = '24px';
            statusDiv.style.fontWeight = 'bold';
        } else if (p.hasSubmitted) {
            statusDiv.innerText = p.isCurrentUser ? 'YOU LOCKED' : 'LOCKED';
        } else {
            statusDiv.innerText = p.isCurrentUser ? 'YOU PENDING' : 'PENDING';
        }
        
        el.appendChild(nameDiv);
        el.appendChild(statusDiv);
        
        // Append before #center-controls so it orbits correctly
        els.nodesContainer.insertBefore(el, document.getElementById('center-controls'));
    });
}

function updateHud() {
    els.hudDisplay.innerText = `SESSION.${state.sessionName} // ROUND ${state.roundNumber} // ${state.statusText}`;
}

function buildShareUrl() {
    const appId = state.hostUser?.app?.appId || POWER_APP.appId;
    const environmentId = (state.hostUser?.app?.environmentId || POWER_APP.environmentId).toLowerCase();
    const tenantId = state.hostUser?.user?.tenantId || state.hostUser?.app?.queryParams?.tenantId || POWER_APP.tenantId;
    const url = new URL(`https://apps.powerapps.com/play/e/${environmentId}/app/${appId}`);
    if (tenantId) {
        url.searchParams.set('tenantId', tenantId);
    }
    if (state.sessionName) {
        url.searchParams.set('session', state.sessionName);
    }
    return url.toString();
}

function closeRoundHistory() {
    state.historyOpen = false;
    els.hudPanel.classList.add('hidden');
    els.hudDisplay.setAttribute('aria-expanded', 'false');
}

async function toggleRoundHistory() {
    state.historyOpen = !state.historyOpen;
    els.hudDisplay.setAttribute('aria-expanded', String(state.historyOpen));
    els.hudPanel.classList.toggle('hidden', !state.historyOpen);
    if (state.historyOpen) {
        await renderRoundHistory();
    }
}

function summariseVotes(votes) {
    const submittedVotes = votes.filter((vote) => vote !== null && vote !== undefined);
    const validVotes = submittedVotes.filter((vote) => vote !== SCORE.question);
    const voteCount = submittedVotes.length;
    if (validVotes.length === 0) {
        return {
            average: 'N/A',
            mode: 'N/A',
            voteCount
        };
    }

    const average = Math.ceil(validVotes.reduce((sum, vote) => sum + vote, 0) / validVotes.length);
    const counts = new Map();
    let mode = validVotes[0];
    let maxCount = 0;

    validVotes.forEach((vote) => {
        const nextCount = (counts.get(vote) || 0) + 1;
        counts.set(vote, nextCount);
        if (nextCount > maxCount) {
            mode = vote;
            maxCount = nextCount;
        }
    });

    return {
        average,
        mode,
        voteCount
    };
}

async function renderRoundHistory() {
    const res = await listItems(TABLES.rounds.name, TABLES.rounds.primaryKey, {
        filter: `${TABLES.rounds.fields.sessionLookup} eq ${state.sessionId}`,
        orderBy: `${TABLES.rounds.fields.round} desc`
    });
    const roundItems = res?.entities || [];
    const rounds = new Map();

    roundItems.forEach((record) => {
        if (record[TABLES.rounds.fields.points] === SCORE.reveal) {
            return;
        }
        const roundNumber = Number.parseInt(record[TABLES.rounds.fields.round], 10);
        if (!Number.isFinite(roundNumber)) {
            return;
        }
        if (!rounds.has(roundNumber)) {
            rounds.set(roundNumber, []);
        }
        rounds.get(roundNumber).push(record[TABLES.rounds.fields.points]);
    });

    const rows = Array.from(rounds.entries())
        .sort((left, right) => right[0] - left[0])
        .map(([roundNumber, votes]) => {
            const summary = summariseVotes(votes);
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'hud-round-row';
            row.innerHTML = `<span>ROUND ${roundNumber}</span><span>AVG ${summary.average}</span><span>MODE ${summary.mode}</span><span>VOTES ${summary.voteCount}</span>`;
            return row;
        });

    els.hudRounds.replaceChildren(...rows);
    if (rows.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'hud-empty';
        empty.textContent = 'No completed rounds yet.';
        els.hudRounds.replaceChildren(empty);
    }
}

function getRoundStatusText() {
    if (state.isRevealed) {
        return 'REVEALED';
    }
    if (state.players.size === 0) {
        return 'WAITING FOR PLAYERS';
    }
    if (state.allSubmitted) {
        return 'READY TO REVEAL';
    }
    if (Array.from(state.players.values()).some((player) => player.hasSubmitted)) {
        return 'COLLECTING VOTES';
    }
    return 'WAITING FOR VOTES';
}

function calculateStats(votes) {
    const validVotes = votes.filter(v => v !== SCORE.question);
    if(validVotes.length === 0) {
        els.statAvg.innerText = "N/A";
        els.statMode.innerText = "N/A";
    } else {
        const sum = validVotes.reduce((a,b) => a+b, 0);
        const avg = Math.ceil(sum / validVotes.length);
        els.statAvg.innerText = avg;
        
        const counts = {};
        let mode = null;
        let max = 0;
        validVotes.forEach(v => {
            counts[v] = (counts[v] || 0) + 1;
            if(counts[v] > max) {
                max = counts[v];
                mode = v;
            }
        });
        els.statMode.innerText = mode || 'N/A';
    }
    els.statsPanel.style.display = 'block';
}

function showToast(msg) {
    els.toast.innerText = msg;
    els.toast.style.opacity = 1;
    setTimeout(() => { els.toast.style.opacity = 0; }, 3000);
}

async function shareSession() {
    const sessionName = state.sessionName || els.sessionInput.value.trim();
    if (!sessionName) {
        showToast('No session to share yet.');
        return;
    }

    const shareUrl = buildShareUrl();

    try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Join link copied.');
    } catch (error) {
        showToast(shareUrl);
        console.error(error);
    }
}

window.addEventListener('DOMContentLoaded', boot);