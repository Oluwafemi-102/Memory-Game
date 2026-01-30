# Memory Game 🧠

A fun and interactive memory card matching game built with vanilla JavaScript, jQuery, and Webpack. Test your memory skills across three difficulty levels!

## Features

✨ **Three Difficulty Levels:**
- **Easy**: 4×4 grid (8 pairs)
- **Medium**: 4×6 grid (12 pairs)
- **Hard**: 6×6 grid (18 pairs)

⏱️ **Game Mechanics:**
- Timer to track how fast you complete the game
- Move counter to monitor your efficiency
- 3 hints per game to help you find matches
- Star rating system based on your performance
- Colorful emoji-based cards for visual appeal

🎮 **Gameplay:**
- Flip cards to find matching pairs
- Complete all matches with the fewest moves and fastest time
- Earn a 3-star rating based on your performance
- Play again or change difficulty at any time

## Installation

### Prerequisites
- Node.js (v12 or higher)
- npm or yarn

### Setup

1. Clone or navigate to the project directory:
```bash
cd "Memory Game"
```

2. Install dependencies:
```bash
npm install
```

## How to Play

1. Click **"Start Game"** to begin
2. Click on cards to flip them and reveal symbols
3. Try to find matching pairs of identical symbols
4. Complete all matches with the fewest moves possible
5. Use your 3 hints strategically when stuck
6. View your final score and star rating when done

## Development

### Start Dev Server
```bash
npm start
```
This will open the game in your default browser with hot-reload enabled.

### Build for Production
```bash
npm run build
```
Creates an optimized build in the `dist/` folder.

### Lint Code
```bash
npm run lint
```
Check JavaScript code for style issues.

## Project Structure

```
Memory Game/
├── src/
│   ├── index.html          # Main HTML file
│   ├── main.js             # Entry point and event handlers
│   ├── game.js             # Game logic (card matching, scoring)
│   ├── ui.js               # UI management (rendering, animations)
│   └── css/
│       └── style.css       # Styles and animations
├── webpack.config.js       # Webpack configuration
├── package.json            # Project dependencies
└── README.md              # This file
```

## Technology Stack

- **JavaScript (ES6+)**: Core game logic
- **jQuery**: DOM manipulation and events
- **Bootstrap 5**: Responsive layout support
- **Webpack**: Module bundling and dev server
- **Font Awesome**: Icons for buttons and labels
- **CSS3**: Modern styling and animations

## Game Statistics

After completing a game, you'll see:
- **Total Moves**: Number of card flips made
- **Total Time**: Seconds elapsed
- **Star Rating**: 1-3 stars based on performance
  - 3 stars: Excellent performance (efficient moves)
  - 2 stars: Good performance
  - 1 star: Keep practicing!

## Tips for Better Performance

1. **Easy level**: Perfect for warming up and practicing
2. **Medium level**: Balanced challenge and time investment
3. **Hard level**: Best for experienced players
4. **Use hints wisely**: Save them for when you're truly stuck
5. **Memorize patterns**: Try to remember card locations as you flip

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (responsive design)

## Troubleshooting

**Game not starting?**
- Make sure you've run `npm install`
- Clear your browser cache
- Try a different browser

**Dev server won't start?**
- Check that port 8080 is available
- Delete `node_modules` and reinstall: `npm install`

## Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Ideas for Contributions
- Add new card themes (animals, sports, etc.)
- Implement leaderboard/high scores
- Add sound effects and background music
- Create a dark mode theme
- Add multiplayer support
- Improve accessibility (ARIA labels, keyboard navigation)
- Add more difficulty levels

## Contact

Have questions, suggestions, or found a bug? Reach out!

- **Email**: oluwafemiotunade@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/memory-game/issues)
- **GitHub Discussions**: [Start a discussion](https://github.com/yourusername/memory-game/discussions)

## License


## Created

Memory Game © 2026 | Built with JavaScript & jQuery

---

Enjoy testing your memory! 🎮✨
