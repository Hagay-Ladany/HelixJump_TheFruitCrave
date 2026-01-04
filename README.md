# 🍎 Helix Jump: The Fruit Crave

A nostalgic arcade-style Helix Jump game with retro chiptune music, collectible fruits, and exciting power-ups!

## 🎮 [Play Now!](https://hagay-ladany.github.io/HelixJump_TheFruitCrave)

---

## 📖 About

Helix Jump: The Fruit Crave is a browser-based 3D arcade game built with Three.js. Guide your bouncing fruit character down the helix tower, collect fruits, avoid hazards, and compete for high scores on the global leaderboard!

## ✨ Features

- **5 Unique Levels** - Each with distinct themes, colors, and challenges
- **Power-ups & Collectibles**:
  - 🍎 Apple - Restores 1 life (max 5)
  - 🍌 Banana - Increases speed and jump height
  - 🍫 Chocolate - Adds 5 seconds to timer
  - 💎 Diamond - Drill through enemies temporarily
- **Hazards to Avoid**:
  - 🪳 Cockroach - Reduces speed and jump height
  - 🤢 Rotten Food - Slows movement
  - 👻 Ghosts, 🦇 Bats, 👹 Monsters
- **Retro Chiptune Soundtrack** - Different music for each level
- **Global Leaderboard** - Compete with players worldwide
- **Difficulty Modes** - Easy, Medium, and Hard with score multipliers
- **PWA Support** - Install on mobile for app-like experience

## 🎯 How to Play

1. **Rotate the tower** by dragging/swiping left or right
2. **Collect fruits** to gain power-ups and points
3. **Avoid hazards** - red platforms and enemies will hurt you!
4. **Complete levels** before time runs out
5. **Save your score** to the leaderboard

## 🕹️ Controls

| Platform | Action |
|----------|--------|
| **Mouse** | Click and drag to rotate |
| **Touch** | Swipe left/right to rotate |
| **Keyboard** | Arrow keys or A/D to rotate |

## 🛠️ Development

### Prerequisites
- Any modern web browser
- A local web server (for development)

### Running Locally

1. Clone the repository:
```bash
git clone https://github.com/Hagay-Ladany/HelixJump_TheFruitCrave.git
cd HelixJump_TheFruitCrave
```

2. Start a local server:
```bash
# Using Python
python -m http.server 8080

# Using Node.js (npx)
npx serve .
```

3. Open `http://localhost:8080` in your browser

### Project Structure
```
HelixJump_TheFruitCrave/
├── index.html          # Main game file
├── js/                 # JavaScript libraries
│   ├── three.min.js    # Three.js 3D engine
│   ├── AudioPlayer.js  # Audio utilities
│   └── Micromod.js     # MOD player
├── chiptune2/          # Chiptune music player
├── sound/              # Game music tracks
├── images/             # Sprites and backgrounds
└── site.webmanifest    # PWA manifest
```

## 🎵 Credits

- **Game Development**: Hagay Ladany
- **3D Engine**: [Three.js](https://threejs.org/)
- **Music Player**: [libopenmpt](https://lib.openmpt.org/libopenmpt/)
- **Music Tracks**: Various chiptune artists (see `sound/original.names`)

## 📄 License

This project is for educational and entertainment purposes.

## 📝 Improvement Suggestions

See [IMPROVEMENTS.md](IMPROVEMENTS.md) for a comprehensive list of suggested enhancements and optimizations.

---

Made with ❤️ by Hagay Ladany
