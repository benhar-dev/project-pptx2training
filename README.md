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

## Installing dependencies

### Node.js

The project will need it's node_modules, so type `npm install`

### Install Choco

Open Powershell as Administrator
Type the following,

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Install ffmpg

Open CMD with admin and type `choco install ffmpeg-full`

### Update the paths

Next you need to add the paths to Windows. Type the following in to the CMD.

```bash
# set the FFMPEG_PATH
setx FFMPEG_PATH "C:\ProgramData\chocolatey\lib\ffmpeg-full\tools\ffmpeg\bin\ffmpeg.exe"

# set the FFPROBE_PATH
setx FFPROBE_PATH "C:\ProgramData\chocolatey\lib\ffmpeg-full\tools\ffmpeg\bin\ffprobe.exe"
```
