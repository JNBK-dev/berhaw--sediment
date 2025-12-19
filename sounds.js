class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = localStorage.getItem('soundsEnabled') !== 'false';
        this.volume = parseFloat(localStorage.getItem('soundVolume') || '0.5');
        
        // Sound file mapping
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
            const audio = new Audio(path);
            audio.volume = this.volume;
            audio.preload = 'auto';
            
            // Handle loading errors gracefully
            audio.onerror = () => {
                console.warn(`Failed to load sound: ${path}`);
            };
            
            this.sounds[key] = audio;
        }
    }
    
    play(soundName) {
        if (!this.enabled) return;
        
        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }
        
        // Clone the audio to allow multiple simultaneous plays
        const clone = sound.cloneNode();
        clone.volume = this.volume;
        
        clone.play().catch(err => {
            // Ignore autoplay restrictions
            if (err.name !== 'NotAllowedError') {
                console.warn('Sound play failed:', err);
            }
        });
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('soundsEnabled', enabled);
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('soundVolume', this.volume);
        
        // Update volume for all loaded sounds
        for (const sound of Object.values(this.sounds)) {
            sound.volume = this.volume;
        }
    }
    
    toggle() {
        this.setEnabled(!this.enabled);
        return this.enabled;
    }
}

// Initialize global sound manager
window.soundManager = new SoundManager();
