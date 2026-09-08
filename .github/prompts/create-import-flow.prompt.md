---
name: Create CBW Import Flow
description: 'Create a CBW file import flow based on the File Manager template pattern.'
argument-hint: 'Accepted files, validation, real import endpoint, and destination route.'
agent: agent
---

Use `create-cbw-screen`. Use the File Manager pattern as a composition reference and reuse local import APIs. Make accepted formats, validation failures, progress, retry, successful records, and post-import actions visible without changing import payloads or endpoints.