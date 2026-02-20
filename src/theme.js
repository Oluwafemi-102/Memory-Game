// Theme management module
export class ThemeManager {
    constructor() {
        this.themes = {
            default: {
                name: "Fruits",
                symbols: ["🍎", "🍌", "🍒", "🍇", "🍊", "🍓", "🍍", "🥭", "🥥", "🍑", "🍈", "🍋", "🍉", "🥝", "🫐", "🍐", "🥑", "🌶️"]
            },
            animals: {
                name: "Animals",
                symbols: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦"]
            },
            flags: {
                name: "Flags",
                symbols: ["🇺🇸", "🇬🇧", "🇨🇦", "🇯🇵", "🇫🇷", "🇩🇪", "🇮🇹", "🇪🇸", "🇦🇺", "🇧🇷", "🇨🇳", "🇮🇳", "🇰🇷", "🇲🇽", "🇷🇺", "🇿🇦", "🇸🇪", "🇳🇴"]
            },
            emoji: {
                name: "Emoji",
                symbols: ["😀", "😂", "🥰", "😎", "🤩", "😜", "🤔", "😴", "🥳", "🤯", "😱", "🤗", "😈", "👻", "🤖", "👽", "👾", "💀"]
            }
        };
        
        this.currentTheme = 'default';
    }
    
    getThemeSymbols(theme) {
        return this.themes[theme]?.symbols || this.themes.default.symbols;
    }
    
    getThemeName(theme) {
        return this.themes[theme]?.name || "Fruits";
    }
    
    setTheme(theme) {
        if (this.themes[theme]) {
            this.currentTheme = theme;
            document.body.className = `theme-${theme}`;
            return true;
        }
        return false;
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
}