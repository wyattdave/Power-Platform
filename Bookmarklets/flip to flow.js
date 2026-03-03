javascript: (() => {
    try {
        const u = new URL(location.href);

        if (u.hostname === 'make.powerautomate.com') {
            return;
        }
        if (u.hostname !== 'make.powerapps.com') {
            alert('This is not a Power Apps cloud flow URL.');
            return;
        }
        const aParts = u.pathname.split('/').filter(Boolean);
        const iEnv = aParts.indexOf('environments');
        const iSol = aParts.indexOf('solutions');
        const iObj = aParts.indexOf('objects');
        const iCloud = aParts.indexOf('cloudflows');
        if (iEnv < 0 || iSol < 0 || iObj < 0 || iCloud < 0) {
            alert('This does not look like a Power Apps cloud flow URL inside a solution.');
            return;
        }
        let env = parts[iEnv + 1] || '';
        env = env.replace(/^default/i, 'Default');
        const sol = parts[iSol + 1];
        const flow = parts[iCloud + 1];
        const newPath = `/environments/${env}/solutions/${sol}/flows/${flow}/`;
        const target = `https://make.powerautomate.com${newPath}${u.search || ''}${u.hash || ''}`;
        location.href = target;
    } catch (e) {
        alert('Could not transform URL: ' + e);
    }
})();
''