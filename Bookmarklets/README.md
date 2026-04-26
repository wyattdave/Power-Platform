# Bookmarklets

This folder contains small JavaScript bookmarklets for Power Platform admin and maker tasks.

## How to use

1. Create a new browser bookmark.
2. Give it a name that matches the script you want to use.
3. Open the script file in this folder and copy its full contents.
4. Paste the script into the bookmark URL or address field.
5. Open the relevant Power Platform page, then click the bookmark.

Some bookmarklets prompt for values such as environment IDs, flow IDs, or a Dynamics URL. Allow popups for the site if the bookmarklet opens a new tab or window.

## Included bookmarklets

### SharePoint List Schema

Use this while on a list/library page to create a json schema. The schema includes name, id, fields and field types, ideal for LLM. The schema is added to your clipboard so paste where you need it.

### flip to flow.js

Use this while viewing a cloud flow inside a solution in Power Apps maker portal. It converts the current Power Apps flow URL into the matching Power Automate designer URL and redirects you there.

Typical use case: you are editing a flow from `make.powerapps.com` and want to jump straight to the Power Automate experience.

### Share Legacy Flow.js

Prompts for an environment ID and a flow ID, then opens the matching flow details page in the Power Platform admin center.

Typical use case: you already know the IDs and want a quick way to open a specific flow without browsing through the portal.

### Legacy Role

Use this from a modern security role page to open the same role in the classic Dynamics role editor. The bookmarklet reads the role GUID from the current URL, asks for the Dynamics environment URL, and opens the classic role editor in a new tab.

Typical use case: switching from the modern admin experience to the legacy role editor for advanced role work.

### Security Group List

Template bookmarklet for tracking environment security groups. Update the `data` array in the file with your own values, then run the bookmarklet to filter and display matching security group names.

Typical use case: maintaining a lightweight lookup list for environment security groups across areas and environment types such as dev, test, or prod.

## Notes

- These scripts are intended for manual browser use and may need updating if Microsoft changes Power Platform URLs.
