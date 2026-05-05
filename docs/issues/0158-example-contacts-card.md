# feat(example): ContactsCard — contacts CRUD + SOS configuration

**Issue:** #158
**Status:** Closed
**Labels:** enhancement, ready-for-agent
**Parent:** #154

## What to build

New `ContactsCard` component covering all six emergency-settings SDK methods and both contacts events.

## Acceptance criteria

- [ ] "Read contacts" → `readContacts()`, displays list as JSON
- [ ] "Add contact" → `addContact({name:'Test',phone:'1234567890'})`, shows operation status
- [ ] "Delete contact" → `deleteContact('1234567890')`, shows operation status
- [ ] "Read SOS" → `readSosSettings()`, displays result
- [ ] "Set SOS" → `setSosSettings({sosNumber:'1234567890',sosMode:1,countDownTime:5})`, shows operation status
- [ ] Subscribes to `contactsData` and `sosSettingsData` events
