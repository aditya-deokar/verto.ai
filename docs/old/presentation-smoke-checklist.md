# Presentation Smoke Checklist

Run this checklist after meaningful presentation-feature changes.

## Create and generate

- Create a presentation from `Agentic Workflow`
- Confirm the workflow dialog shows real backend step progress
- Confirm generation ends in the editor for the created project

- Create a presentation from `Creative AI`
- Confirm outline editing still works
- Confirm generation reaches the editor with the selected theme

- Create a presentation from `Start from Scratch`
- Confirm manual outline cards generate a deck successfully

## Editor

- Open an existing presentation in the editor
- Confirm slides load from Prisma
- Edit slide content and save
- Refresh and confirm changes persist
- Change theme and confirm it persists
- Reorder slides and confirm save still works

## Presentation mode

- Open `/present/[presentationId]`
- Confirm keyboard navigation works
- Confirm fullscreen toggle works
- Confirm grid view works

## Sharing

- Publish a presentation from the navbar
- Copy the share link and open it in a separate browser session
- Confirm the shared presentation renders without auth
- Disable sharing and confirm the same link no longer loads

## Export

- Export a generated deck as PDF
- Confirm slide order is correct
- Confirm theme styling is recognizable
- Confirm images render when present

## Security and ownership

- Confirm one user cannot open another user’s editor route by guessing an ID
- Confirm one user cannot mutate another user’s presentation via save/theme/share actions

## Failure handling

- Trigger a generation failure intentionally if possible
- Confirm the workflow dialog surfaces the failed step
- Confirm the generation run ends in a failed state instead of hanging
