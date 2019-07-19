# Interactive chip8 emulator  
This is an experimental project, created to learn how emulation works from inside.   
It includes the emulator and some debugging tools like console and register view.  
You can check the demo [here](https://remixer-dec.github.io/chip8emu).
To run this project, you have to use a modern browser.  

![Screenshot](https://i.imgur.com/mcZqnSS.png)  

# Mobile-friendly progressive web app with dark theme  
![ScreenshotMobile](https://i.imgur.com/LN8U6Pw.gif)  

**Features:**
- [X] blinking reduction (configurable)  
- [X] key binding  
- [X] offline-mode & cache management  
- [X] loadable screen & register states
- [X] instructions are translated into human-readable language (in debug mode)

**Emulator object**  
Emulator and all it's components are available from ```window.emu``` object  

**Technologies used in this project:**  
JS ES6+ syntax:  
- arrow functions + let variables  
- imports / exports  
- promises  
- generators / iterators  
- Sets  
- Methods  

HTML/CSS syntax:  
- Web Components  
- CSS Grid  

**TODO:**  
 - [ ] WebGL renderer
 - [ ] make different UI's with frameworks  
 - [ ] game specific keyboards / configs  
 - [ ] Gamepad support



**Special thanks to:**  
[mir3z/chip8-emu](https://github.com/mir3z/chip8-emu) for extra ROMs & ROM description,  
[Wikipedia article about CHIP-8](https://en.wikipedia.org/wiki/CHIP-8)  
[Chip-8 manual](http://chip8.sourceforge.net/chip8-1.1.pdf)  
[The article about writing an emulator](http://www.multigesture.net/articles/how-to-write-an-emulator-chip-8-interpreter/)  
for the information and /r/emulation & /r/emudev for inspiring me to do this project.
