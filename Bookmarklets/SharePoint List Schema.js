javascript:(async () => {
    if (typeof _spPageContextInfo === 'undefined' || !_spPageContextInfo.listTitle) {
        alert("Please run this on a SharePoint List page.");
        return;
    }
    const response = await fetch(`${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('${_spPageContextInfo.listTitle}')/fields?$filter=Hidden eq false and ReadOnlyField eq false`, {
        headers: { "Accept": "application/json; odata=verbose" }
    });
    const data = await response.json();
    const schema = {
        listName: _spPageContextInfo.listTitle,
        extractDate: new Date().toISOString(),
        columns: data.d.results.map(f => ({
            name: f.Title,
            internal: f.InternalName,
            type: f.TypeAsString,
            required: f.Required
        }))
    };
    const jsonString = JSON.stringify(schema, null, 2);
    console.log(jsonString);
    await navigator.clipboard.writeText(jsonString);
    alert("JSON Schema copied to clipboard!");
})();
