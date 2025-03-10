# pptx2training

A project to create a working build process which can be migrated to github actions.

## Stages

- [x] Convert PPTX file to sub-videos for slides
- [x] Extract presenter notes
- [x] Convert presenter notes to scripts
- [ ] Check scripts for audio conversions (i.e. text replace)
- [x] Convert scripts to audio files
- [x] Combine audio with video
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

## Choosing your voicing

You only need to follow one of the sections below. The demo included as an mp4 was created using ElevenLabs + Cloned voice. This is all part of the ElevenLabs offering, when paying for the

### Using OpenAi Voice

You will need to obtian an OpenAi API Key, which has access to the tts api.

Created a .env file in the project root with the following information.

```
USE_API="openai"
OPENAI_API_KEY="your_key_goes_here"
```

### Using ElevenLabs Voice

You will need to obtian an ElevenLabs API Key.

Created a .env file in the project root with the following information.

```
USE_API="elevenlabstts"
ELEVENLABS_API_KEY="your_key_goes_here"
```

### Using Google TTS

#### Getting started

1. Created a .env file in the project root with the following information.

   ```
   USE_API="googletts"
   ```

2. Setup a [google cloud account](https://cloud.google.com/)

3. You will need to create a project, in this example called "beckhofftraining".

4. Enable the text to speach api in this project.

5. Install the google cloud cli tools

   In powershell type the following.

   ```bash
   (New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")

   & $env:Temp\GoogleCloudSDKInstaller.exe
   ```

6. Follow the installer. Once installed it will open the cmd.

   ```bash
   ## this may have already been called by the installer
   ## by default it will do this following installation.
   gcloud init

   ## You will be asked to select a cloud project, pick the one you have made in the previous steps, i.e. beckhofftraining

   ## this sets up a default application login which will be used by this app
   gcloud auth application-default login
   ```
