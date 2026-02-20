// Audio management module with cross-browser compatible sounds
export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.soundEnabled = true;
        
        // Initialize audio context on first user interaction
        this.initAudioContext();
    }
    
    initAudioContext() {
        try {
            // Cross-browser AudioContext
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            if (window.AudioContext) {
                this.audioContext = new AudioContext();
            }
        } catch (e) {
            console.log('Web Audio API not supported - sounds disabled');
            this.enabled = false;
        }
    }
    
    async ensureAudioContext() {
        if (!this.audioContext) {
            this.initAudioContext();
        }
        
        // Resume audio context if suspended (required by browser autoplay policies)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (e) {
                console.log('Could not resume audio context');
            }
        }
    }
    
    async play(soundType) {
        if (!this.enabled || !this.audioContext || !this.soundEnabled) return;
        
        await this.ensureAudioContext();
        
        try {
            switch(soundType) {
                case 'flip':
                    this.playFlipSound();
                    break;
                case 'match':
                    this.playMatchSound();
                    break;
                case 'win':
                    this.playWinSound();
                    break;
                case 'hint':
                    this.playHintSound();
                    break;
                case 'timeout':
                    this.playTimeoutSound();
                    break;
            }
        } catch (e) {
            console.log('Error playing sound:', e);
        }
    }
    
    // FIXED: Using setValueAtTime instead of exponentialRampToValue
    playFlipSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    // FIXED: Using linearRampToValue instead of exponentialRampToValue
    playMatchSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }
    
    // FIXED: Simplified win sound without complex frequency ramps
    playWinSound() {
        const now = this.audioContext.currentTime;
        
        // Simple ascending notes - more compatible
        const frequencies = [523.25, 659.25, 783.99, 1046.50];
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, now + index * 0.1);
            
            gainNode.gain.setValueAtTime(0.1, now + index * 0.1);
            gainNode.gain.setValueAtTime(0.01, now + index * 0.1 + 0.2);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(now + index * 0.1);
            oscillator.stop(now + index * 0.1 + 0.2);
        });
    }
    
    // FIXED: Using setValueAtTime instead of exponentialRampToValue
    playHintSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1500, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    // FIXED: Simplified timeout sound
    playTimeoutSound() {
        const now = this.audioContext.currentTime;
        
        // Simple descending beeps
        for (let i = 0; i < 3; i++) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'triangle'; // More audible than sawtooth
            oscillator.frequency.setValueAtTime(400 - i * 50, now + i * 0.15);
            
            gainNode.gain.setValueAtTime(0.15, now + i * 0.15);
            gainNode.gain.setValueAtTime(0.01, now + i * 0.15 + 0.1);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(now + i * 0.15);
            oscillator.stop(now + i * 0.15 + 0.1);
        }
    }
    
    // Fallback method using Web Audio API compatible with all browsers
    playBeep(type = 'flip') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        switch(type) {
            case 'flip':
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.1;
                break;
            case 'match':
                oscillator.frequency.value = 600;
                gainNode.gain.value = 0.15;
                break;
            case 'hint':
                oscillator.frequency.value = 1000;
                gainNode.gain.value = 0.1;
                break;
            case 'timeout':
                oscillator.frequency.value = 400;
                gainNode.gain.value = 0.2;
                break;
        }
        
        oscillator.type = 'sine';
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    toggle() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }
    
    getStatus() {
        return this.soundEnabled;
    }
}