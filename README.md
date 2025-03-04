# pptx2training

A project to create a working build process which can be migrated to github actions.

## Stages

- [x] Convert PPTX file to sub-videos for slides
- [x] Extract presenter notes
- [x] Convert presenter notes to scripts
- [ ] Check scripts for audio conversions (i.e. text replace)
- [ ] Convert scripts to audio files
- [ ] Combine audio with video
- [ ] Release updated training videos to training platform

## Supported producerData.Direction

| command   | description                             |
| --------- | --------------------------------------- |
| {pause x} | pause the speaker for time x in seconds |
