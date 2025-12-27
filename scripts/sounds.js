class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = localStorage.getItem('soundsEnabled') !== 'false';
        this.volume = parseFloat(localStorage.getItem('soundVolume') || '0.5');
        
        // Sound file mapping - paths relative to index.html location
        this.soundFiles = {
            prompt: 'sounds/hawber--sound-001--prompt.wav',
            creation: 'sounds/hawber--sound-002--creation.wav',
            submitted: 'sounds/hawber--sound-003--completion-submitted.wav',
            accepted: 'sounds/hawber--sound-004--completion-accepted.wav',
            alert: 'sounds/hawber--sound-005--attention-alert.wav',
            notification: 'sounds/hawber--sound-006--attention-notification.wav',
            riffle: 'sounds/hawber--sound-007--pages-riffle.wav',
            keyboard: 'sounds/hawber--sound-008--keyboard-sent.wav',
            bite: 'sounds/hawber--sound-009--receiving-bite.wav',
            chomp: 'sounds/hawber--sound-010--receiving-chomp.wav',
            reclick: 'sounds/hawber--sound-011--pen-reclick.wav'
        };
        
        this.loadSounds();
    }
    
    loadSounds() {
        for (const [key, path] of Object.entries(this.soundFiles)) {
            const audio = new Audio();
            audio.src = path;
            audio.volume = this.volume;
            audio.preload = 'auto';
            
            audio.onerror = () => {
                console.error('Failed to load sound:', path);
            };
            
            this.sounds[key] = audio;
        }
    }
    
    play(soundName) {
        if (!this.enabled) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            // Clone and play to allow overlapping sounds
            const clone = sound.cloneNode();
            clone.volume = this.volume;
            clone.play().catch(err => {
                // Ignore errors (e.g., user hasn't interacted with page yet)
            });
        }
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('soundsEnabled', enabled.toString());
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('soundVolume', this.volume.toString());
        
        // Update all loaded sounds
        for (const sound of Object.values(this.sounds)) {
            sound.volume = this.volume;
        }
    }
    
    isEnabled() {
        return this.enabled;
    }
    
    getVolume() {
        return this.volume;
    }
}

// Create global instance
const soundManager = new SoundManager();
