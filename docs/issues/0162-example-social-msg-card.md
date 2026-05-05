# feat(example): SocialMsgCard — read and write social message settings

**Issue:** #162
**Status:** Closed
**Labels:** enhancement, ready-for-agent
**Parent:** #154

## What to build

New `SocialMsgCard` covering the two social-message SDK methods and the `socialMsgData` event.

## Acceptance criteria

- [ ] "Read" → `readSocialMsgData()`, displays result as JSON
- [ ] "Write" → `writeSocialMsgData` with a hardcoded sample (e.g. enabling QQ and WeChat), displays `OperationStatus` result
- [ ] Subscribes to `socialMsgData` event and shows the last payload
