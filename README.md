# pptx2training

A project to create a working build process which can be migrated to github actions.

## Stages

- Extract presenter notes to producerData
- Convert PPTX file to sub-videos for slides
- Run translation on producerData for pronunciation
- Encode producerData.Scripts to audio
- Combine audio using producerData.Direction
- Combine audio with video
- Release updated training videos to training platform

## Supported producerData.Direction

| command | description |
| - | - |
| {pause x} | pause the speaker for time x in seconds |
| {new 'Name'} | instruct the build to create a new movie file from this point |
| {speaker 'SpeakerName'} | instruct the build to use a specific voice from this point until instructed otherwise |
| {speaker 'default'} | return the voice to build default |
