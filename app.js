class App {
    constructor() {
        // DOM elements - Auth View
        this.authView = document.getElementById("authView");
        this.authName = document.getElementById("authName");
        this.authKey = document.getElementById("authKey");
        this.loginBtn = document.getElementById("loginBtn");
        this.quickPlayBtn = document.getElementById("quickPlayBtn");

        // DOM elements - Home View
        this.homeView = document.getElementById("homeView");
        this.homePlayerName = document.getElementById("homePlayerName");
        this.homePlayerKey = document.getElementById("homePlayerKey");
        
        // Tab navigation
        this.writeTab = document.getElementById("writeTab");
        this.toolkitTab = document.getElementById("toolkitTab");
        this.playTab = document.getElementById("playTab");
        this.peopleTab = document.getElementById("peopleTab");
        this.settingsTab = document.getElementById("settingsTab");
        this.writeSection = document.getElementById("writeSection");
        this.toolkitSection = document.getElementById("toolkitSection");
        this.playSection = document.getElementById("playSection");
        this.peopleSection = document.getElementById("peopleSection");
        this.settingsSection = document.getElementById("settingsSection");
        
        // Write section
        this.documentsList = document.getElementById("documentsList");
        this.createDocBtn = document.getElementById("createDocBtn");
        
        // Toolkit section
        this.objectTypesList = document.getElementById("objectTypesList");
        this.createObjectTypeBtn = document.getElementById("createObjectTypeBtn");
        
        // Play section
        this.createRoomBtn = document.getElementById("createRoomBtn");
        this.roomsList = document.getElementById("roomsList");
        
        // People section
        this.userSearch = document.getElementById("userSearch");
        this.usersList = document.getElementById("usersList");
        
        // Settings section
        this.settingsName = document.getElementById("settingsName");
        this.settingsKey = document.getElementById("settingsKey");
        this.settingsCreated = document.getElementById("settingsCreated");
        this.soundToggle = document.getElementById("soundToggle");
        this.volumeSlider = document.getElementById("volumeSlider");
        this.logoutBtn = document.getElementById("logoutBtn");

        // DOM elements - Profile View
        this.profileView = document.getElementById("profileView");
        this.profileName = document.getElementById("profileName");
        this.profileKey = document.getElementById("profileKey");
        this.profileJoined = document.getElementById("profileJoined");
        this.profileDocCount = document.getElementById("profileDocCount");
        this.profileDocsList = document.getElementById("profileDocsList");
        this.backFromProfileBtn = document.getElementById("backFromProfileBtn");

        // DOM elements - Object Type Builder View
        this.objectTypeBuilderView = document.getElementById("objectTypeBuilderView");
        this.objectTypeBuilderTitle = document.getElementById("objectTypeBuilderTitle");
        this.objectTypeName = document.getElementById("objectTypeName");
        this.fieldsList = document.getElementById("fieldsList");
        this.addFieldBtn = document.getElementById("addFieldBtn");
        this.objectTypeTags = document.getElementById("objectTypeTags");
        this.saveObjectTypeBtn = document.getElementById("saveObjectTypeBtn");
        this.deleteObjectTypeBtn = document.getElementById("deleteObjectTypeBtn");
        this.backFromBuilderBtn = document.getElementById("backFromBuilderBtn");

        // DOM elements - Editor View
        this.editorView = document.getElementById("editorView");
        this.editMode = document.getElementById("editMode");
        this.readerMode = document.getElementById("readerMode");
        this.modeToggleBtn = document.getElementById("modeToggleBtn");
        this.docTitle = document.getElementById("docTitle");
        this.docPrivacy = document.getElementById("docPrivacy");
        this.docContent = document.getElementById("docContent");
        this.readerTitle = document.getElementById("readerTitle");
        this.readerContent = document.getElementById("readerContent");
        this.editorStatus = document.getElementById("editorStatus");
        this.backToHomeBtn = document.getElementById("backToHomeBtn");
        this.saveDocBtn = document.getElementById("saveDocBtn");
        this.deleteDocBtn = document.getElementById("deleteDocBtn");
        this.deleteDocBtnReader = document.getElementById("deleteDocBtnReader");

        // DOM elements - Activity Menu View
        this.activityMenuView = document.getElementById("activityMenuView");
        this.menuRoomCode = document.getElementById("menuRoomCode");
        this.menuPlayerChips = document.getElementById("menuPlayerChips");
        this.activitiesList = document.getElementById("activitiesList");
        this.newActivityBtn = document.getElementById("newActivityBtn");
        this.leaveRoomFromMenuBtn = document.getElementById("leaveRoomFromMenuBtn");
        
        // Activity Creator Modal
        this.activityCreatorModal = document.getElementById("activityCreatorModal");
        this.cancelActivityBtn = document.getElementById("cancelActivityBtn");
        
        // DOM elements - Chat View
        this.chatView = document.getElementById("chatView");
        this.chatRoomCode = document.getElementById("chatRoomCode");
        this.chatMessages = document.getElementById("chatMessages");
        this.chatInput = document.getElementById("chatInput");
        this.sendChatBtn = document.getElementById("sendChatBtn");
        this.leaveChatBtn = document.getElementById("leaveChatBtn");

        // DOM elements - Dice View
        this.diceView = document.getElementById("diceView");
        this.diceRoomCode = document.getElementById("diceRoomCode");
        this.diceRolls = document.getElementById("diceRolls");
        this.rollD4Btn = document.getElementById("rollD4Btn");
        this.rollD6Btn = document.getElementById("rollD6Btn");
        this.rollD8Btn = document.getElementById("rollD8Btn");
        this.rollD10Btn = document.getElementById("rollD10Btn");
        this.rollD12Btn = document.getElementById("rollD12Btn");
        this.rollD20Btn = document.getElementById("rollD20Btn");
        this.rollD100Btn = document.getElementById("rollD100Btn");
        this.leaveDiceBtn = document.getElementById("leaveDiceBtn");

        // DOM elements - Collaborative Story View
        this.collabDocView = document.getElementById("collabDocView");
        this.collabDocRoomCode = document.getElementById("collabDocRoomCode");
        this.turnIndicator = document.getElementById("turnIndicator");
        this.turnPlayer = document.getElementById("turnPlayer");
        this.storyBlocks = document.getElementById("storyBlocks");
        this.yourTurnSection = document.getElementById("yourTurnSection");
        this.waitingTurnSection = document.getElementById("waitingTurnSection");
        this.yourTurnInput = document.getElementById("yourTurnInput");
        this.charCount = document.getElementById("charCount");
        this.submitBlockBtn = document.getElementById("submitBlockBtn");
        this.passBtn = document.getElementById("passBtn");
        this.waitingText = document.getElementById("waitingText");
        this.leaveCollabDocBtn = document.getElementById("leaveCollabDocBtn");

        // DOM elements - Game View
        this.gameView = document.getElementById("gameView");
        this.gameRoomCode = document.getElementById("gameRoomCode");
        this.gameStatus = document.getElementById("gameStatus");
        this.gameArea = document.getElementById("gameArea");
        this.gamePrompt = document.getElementById("gamePrompt");
        this.gameButton = document.getElementById("gameButton");
        this.watchBtn = document.getElementById("watchBtn");
        this.playBtn = document.getElementById("playBtn");
        this.leaveGameBtn = document.getElementById("leaveGameBtn");
        this.scoreboard = document.getElementById("scoreboard");

        this.currentUser = null;
        this.currentRoomCode = null;
        this.currentDocId = null;
        this.currentProfileUserId = null;
        this.currentActivityId = null;
        this.openedFromProfile = false;
        this.isReaderMode = false;
        this.playersListener = null;
        this.gameListener = null;
        this.documentsListener = null;
        this.usersListener = null;
        this.activitiesListener = null;
        this.chatListener = null;
        this.chatInitialLoadComplete = false;
        this.diceListener = null;
        this.diceInitialLoadComplete = false;
        this.storyListener = null;
        this.storyTurnListener = null;
        this.storyUsersListener = null;
        this.storyBlocksListener = null;
        this.currentObjectTypeId = null;
        this.objectTypesListener = null;
        this.fieldIdCounter = 0;
        this.roundStartTime = null;

        // Bind events
        this.loginBtn.onclick = () => this.handleLogin();
        this.quickPlayBtn.onclick = () => this.handleQuickPlay();
        this.logoutBtn.onclick = () => this.handleLogout();
        
        // Tab navigation
        this.writeTab.onclick = () => this.switchTab('write');
        this.toolkitTab.onclick = () => this.switchTab('toolkit');
        this.playTab.onclick = () => this.switchTab('play');
        this.peopleTab.onclick = () => this.switchTab('people');
        this.settingsTab.onclick = () => this.switchTab('settings');
        
        // Profile navigation
        this.backFromProfileBtn.onclick = () => this.closeProfile();
        
        // Object Type Builder actions
        this.createObjectTypeBtn.onclick = () => this.createObjectType();
        this.backFromBuilderBtn.onclick = () => this.closeObjectTypeBuilder();
        this.addFieldBtn.onclick = () => this.addField();
        this.saveObjectTypeBtn.onclick = () => this.saveObjectType();
        this.deleteObjectTypeBtn.onclick = () => this.deleteObjectType();
        
        // Document actions
        this.createDocBtn.onclick = () => this.createDocument();
        this.backToHomeBtn.onclick = () => this.closeEditor();
        this.modeToggleBtn.onclick = () => this.toggleMode();
        this.saveDocBtn.onclick = () => this.saveDocument();
        this.deleteDocBtn.onclick = () => this.deleteDocument();
        this.deleteDocBtnReader.onclick = () => this.deleteDocument();
        
        // Room actions
        this.createRoomBtn.onclick = () => this.createRoom();
        this.leaveRoomFromMenuBtn.onclick = () => this.leaveRoom();
        
        // Activity Menu actions
        this.newActivityBtn.onclick = () => this.showActivityCreator();
        this.cancelActivityBtn.onclick = () => this.hideActivityCreator();
        
        // Chat actions
        this.leaveChatBtn.onclick = () => this.leaveActivity();
        this.sendChatBtn.onclick = () => this.sendChatMessage();
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });
        
        // Dice actions
        this.leaveDiceBtn.onclick = () => this.leaveActivity();
        this.rollD4Btn.onclick = () => this.rollDice(4);
        this.rollD6Btn.onclick = () => this.rollDice(6);
        this.rollD8Btn.onclick = () => this.rollDice(8);
        this.rollD10Btn.onclick = () => this.rollDice(10);
        this.rollD12Btn.onclick = () => this.rollDice(12);
        this.rollD20Btn.onclick = () => this.rollDice(20);
        this.rollD100Btn.onclick = () => this.rollDice(100);
        
        // Collaborative Story actions
        this.leaveCollabDocBtn.onclick = () => this.leaveActivity();
        this.submitBlockBtn.onclick = () => this.submitStoryBlock();
        this.passBtn.onclick = () => this.passTurn();
        this.yourTurnInput.addEventListener('input', () => {
            const length = this.yourTurnInput.value.length;
            this.charCount.textContent = `${length} / 500`;
        });
        
        // Game actions
        this.watchBtn.onclick = () => this.setPlayerStatus("watching");
        this.playBtn.onclick = () => this.setPlayerStatus("playing");
        this.leaveGameBtn.onclick = () => this.leaveActivity();
        this.gameButton.onclick = () => this.handleGameClick();

        // Auto-save on typing (debounced)
        let saveTimeout;
        this.docTitle.addEventListener("input", () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => this.autoSave(), 1000);
        });
        this.docContent.addEventListener("input", () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => this.autoSave(), 1000);
        });
        this.docPrivacy.addEventListener("change", () => {
            this.autoSave();
        });
        
        // User search
        this.userSearch.addEventListener("input", () => {
            this.filterUsers(this.userSearch.value.trim().toLowerCase());
        });
        
        // Sound controls
        this.soundToggle.addEventListener("change", () => {
            soundManager.setEnabled(this.soundToggle.checked);
        });
        
        this.volumeSlider.addEventListener("input", () => {
            const volume = parseInt(this.volumeSlider.value) / 100;
            soundManager.setVolume(volume);
        });

        // Auto-login if session exists
        this.checkSession();
    }

    generateId() {
        return crypto.randomUUID();
    }

    generateKey() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let key = "";
        for (let i = 0; i < 3; i++)
            key += chars[Math.floor(Math.random() * chars.length)];
        return key;
    }

    generateRoomCode() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 4; i++)
            code += chars[Math.floor(Math.random() * chars.length)];
        return code;
    }

    async checkSession() {
        const sessionId = localStorage.getItem("sessionUserId");
        if (sessionId) {
            // Try to load user from Firebase
            const userSnap = await db.ref(`users/${sessionId}`).once("value");
            if (userSnap.exists()) {
                this.currentUser = { id: sessionId, ...userSnap.val() };
                soundManager.play('prompt');
                this.showToast(`Welcome back, ${this.currentUser.name}!`, "success");
                this.showHomeView();
                return;
            } else {
                // Session expired or user deleted
                localStorage.removeItem("sessionUserId");
            }
        }
        
        // No valid session, show auth
        this.showAuthView();
    }

    async handleLogin() {
        const name = this.authName.value.trim();
        const key = this.authKey.value.trim().toUpperCase();

        if (!name) {
            this.showToast("Please enter your name", "error");
            return;
        }

        if (key) {
            // Try to log in with existing account
            await this.loginUser(name, key);
        } else {
            // Create new account
            await this.createUser(name);
        }
    }

    async loginUser(name, key) {
        // Search for user with matching name and key
        const usersSnap = await db.ref("users").orderByChild("name").equalTo(name).once("value");
        
        let foundUser = null;
        usersSnap.forEach(userSnap => {
            const userData = userSnap.val();
            if (userData.key === key) {
                foundUser = { id: userSnap.key, ...userData };
            }
        });

        if (foundUser) {
            this.currentUser = foundUser;
            localStorage.setItem("sessionUserId", foundUser.id);
            
            // Update last login
            await db.ref(`users/${foundUser.id}`).update({
                lastLogin: Date.now()
            });
            
            soundManager.play('prompt');
            this.showToast(`Welcome back, ${foundUser.name}!`, "success");
            this.showHomeView();
        } else {
            soundManager.play('alert');
            this.showToast("No account found with that name and key", "error");
        }
    }

    async createUser(name) {
        const userId = this.generateId();
        const key = this.generateKey();

        const newUser = {
            name: name,
            key: key,
            createdAt: Date.now(),
            lastLogin: Date.now()
        };

        try {
            await db.ref(`users/${userId}`).set(newUser);
            
            this.currentUser = { id: userId, ...newUser };
            localStorage.setItem("sessionUserId", userId);
            
            soundManager.play('prompt');
            this.showToast(`Account created! Your key is: ${key}`, "success", 5000);
            this.showHomeView();
        } catch (err) {
            console.error("Failed to create user:", err);
            soundManager.play('alert');
            this.showToast("Failed to create account. Please try again.", "error");
        }
    }

    handleQuickPlay() {
        // Create temporary user without saving to Firebase
        const tempId = this.generateId();
        const tempKey = this.generateKey();
        
        this.currentUser = {
            id: tempId,
            name: this.authName.value.trim() || "Guest",
            key: tempKey,
            isGuest: true
        };
        
        this.showToast("Playing as guest (not saved)", "success");
        this.showHomeView();
    }

    handleLogout() {
        // Clear session
        localStorage.removeItem("sessionUserId");
        
        // Leave room if in one
        if (this.currentRoomCode) {
            this.leaveRoom();
        }
        
        // Stop listening to documents
        if (this.documentsListener) {
            db.ref("documents").off("value", this.documentsListener);
            this.documentsListener = null;
        }
        
        // Clear current user
        const userName = this.currentUser.name;
        this.currentUser = null;
        this.currentDocId = null;
        
        // Reset inputs
        this.authName.value = "";
        this.authKey.value = "";
        
        this.showToast(`Goodbye, ${userName}!`, "success");
        this.showAuthView();
    }

    showAuthView() {
        this.authView.classList.remove("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        
        // Stop listening to rooms
        db.ref("rooms").off();
    }

    showHomeView() {
        this.authView.classList.add("hidden");
        this.homeView.classList.remove("hidden");
        this.editorView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        
        soundManager.play('bite');
        
        if (!this.currentUser) {
            console.error("showHomeView called but currentUser is null!");
            this.showAuthView();
            return;
        }
        
        // Update UI
        this.homePlayerName.textContent = this.currentUser.name;
        this.homePlayerKey.textContent = this.currentUser.key;
        
        // Populate settings
        this.settingsName.textContent = this.currentUser.name;
        this.settingsKey.textContent = this.currentUser.key;
        
        // Initialize sound controls from saved preferences
        this.soundToggle.checked = soundManager.enabled;
        this.volumeSlider.value = Math.round(soundManager.volume * 100);
        
        // Format creation date if available
        if (this.currentUser.createdAt) {
            const date = new Date(this.currentUser.createdAt);
            this.settingsCreated.textContent = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            this.settingsCreated.textContent = "Unknown";
        }
        
        // Listen for room list updates
        db.ref("rooms").on("value", snap => this.renderRooms(snap));
        
        // Listen for user's documents
        this.listenToDocuments();
        
        // Default to Write tab
        this.switchTab('write');
    }

    switchTab(tabName) {
        // Remove active class from all tabs
        this.writeTab.classList.remove('active');
        this.toolkitTab.classList.remove('active');
        this.playTab.classList.remove('active');
        this.peopleTab.classList.remove('active');
        this.settingsTab.classList.remove('active');
        
        // Hide all sections
        this.writeSection.classList.add('hidden');
        this.toolkitSection.classList.add('hidden');
        this.playSection.classList.add('hidden');
        this.peopleSection.classList.add('hidden');
        this.settingsSection.classList.add('hidden');
        
        // Show selected tab and section
        if (tabName === 'write') {
            this.writeTab.classList.add('active');
            this.writeSection.classList.remove('hidden');
        } else if (tabName === 'toolkit') {
            this.toolkitTab.classList.add('active');
            this.toolkitSection.classList.remove('hidden');
            // Load object types when switching to toolkit tab
            this.listenToObjectTypes();
        } else if (tabName === 'play') {
            this.playTab.classList.add('active');
            this.playSection.classList.remove('hidden');
        } else if (tabName === 'people') {
            this.peopleTab.classList.add('active');
            this.peopleSection.classList.remove('hidden');
            // Load users when switching to people tab
            this.listenToUsers();
        } else if (tabName === 'settings') {
            this.settingsTab.classList.add('active');
            this.settingsSection.classList.remove('hidden');
        }
    }

    async createRoom() {
        const roomCode = this.generateRoomCode();

        try {
            const roomRef = db.ref("rooms/" + roomCode);
            await roomRef.set({ 
                createdAt: Date.now(),
                createdBy: this.currentUser.id
            });
            this.joinRoom(roomCode);
        } catch (err) {
            console.error("Failed to create room:", err);
            this.showToast("Failed to create room. Please try again.", "error");
        }
    }

    async setPlayerStatus(status) {
        if (!this.currentRoomCode || !this.currentActivityId) return;

        const activityRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}`);
        const gameRef = activityRef.child("gameState");
        
        await gameRef.child(`playerStatus/${this.currentUser.id}`).set(status);

        // If playing, initialize score if not exists
        if (status === "playing") {
            const scoreSnap = await gameRef.child(`scores/${this.currentUser.id}`).once("value");
            if (!scoreSnap.exists()) {
                await gameRef.child(`scores/${this.currentUser.id}`).set({
                    name: this.currentUser.name,
                    points: 0
                });
            }
        }

        // Visual feedback
        const btn = status === "playing" ? this.playBtn : this.watchBtn;
        btn.style.transform = "scale(0.95)";
        setTimeout(() => {
            btn.style.transform = "";
        }, 200);
    }

    renderRooms(snap) {
        this.roomsList.innerHTML = "";
        
        if (!snap.exists()) {
            const emptyMsg = document.createElement("div");
            emptyMsg.style.textAlign = "center";
            emptyMsg.style.color = "#94a3b8";
            emptyMsg.style.padding = "20px";
            emptyMsg.textContent = "No rooms available. Create one!";
            this.roomsList.appendChild(emptyMsg);
            return;
        }

        snap.forEach(roomSnap => {
            const code = roomSnap.key;
            const players = roomSnap.child("players").numChildren();

            const roomCard = document.createElement("div");
            roomCard.className = "room-card";
            
            const roomCode = document.createElement("div");
            roomCode.className = "room-code-text";
            roomCode.textContent = code;
            
            const roomPlayers = document.createElement("div");
            roomPlayers.className = "room-players";
            roomPlayers.textContent = `${players} ${players === 1 ? 'player' : 'players'}`;
            
            roomCard.appendChild(roomCode);
            roomCard.appendChild(roomPlayers);
            roomCard.onclick = () => this.joinRoom(code);
            
            this.roomsList.appendChild(roomCard);
        });
    }

    showToast(message, type = "success", duration = 3000) {
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = "toastSlide 0.3s ease-out reverse";
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ===== DOCUMENT METHODS =====

    listenToDocuments() {
        if (!this.currentUser) return;

        if (this.documentsListener) {
            db.ref("documents").off("value", this.documentsListener);
        }

        // Listen to all documents where user is the author
        this.documentsListener = db.ref("documents")
            .orderByChild("authorId")
            .equalTo(this.currentUser.id)
            .on("value", snap => this.renderDocuments(snap));
    }

    renderDocuments(snap) {
        this.documentsList.innerHTML = "";

        if (!snap.exists()) {
            const emptyMsg = document.createElement("div");
            emptyMsg.className = "document-empty";
            emptyMsg.textContent = "No documents yet. Create your first one!";
            this.documentsList.appendChild(emptyMsg);
            return;
        }

        snap.forEach(docSnap => {
            const docId = docSnap.key;
            const doc = docSnap.val();

            const docCard = document.createElement("div");
            docCard.className = "document-card";

            const docTitle = document.createElement("div");
            docTitle.className = "document-title";
            docTitle.textContent = doc.title || "Untitled Document";

            const docMeta = document.createElement("div");
            docMeta.className = "document-meta";
            
            const created = new Date(doc.createdAt).toLocaleDateString();
            const updated = new Date(doc.updatedAt).toLocaleDateString();
            
            docMeta.innerHTML = `
                <span>Created: ${created}</span>
                <span>Updated: ${updated}</span>
            `;

            docCard.appendChild(docTitle);
            docCard.appendChild(docMeta);
            docCard.onclick = () => this.openDocument(docId);

            this.documentsList.appendChild(docCard);
        });
    }

    async createDocument() {
        const docId = this.generateId();
        const now = Date.now();

        const newDoc = {
            title: "Untitled Document",
            content: "",
            authorId: this.currentUser.id,
            authorName: this.currentUser.name,
            createdAt: now,
            updatedAt: now,
            privacy: "private",
            metadata: {
                editors: [this.currentUser.id],
                lastEditedBy: this.currentUser.id
            }
        };

        try {
            await db.ref(`documents/${docId}`).set(newDoc);
            this.openDocument(docId);
            this.showToast("Document created!", "success");
        } catch (err) {
            console.error("Failed to create document:", err);
            this.showToast("Failed to create document", "error");
        }
    }

    async openDocument(docId, fromProfile = false) {
        this.currentDocId = docId;
        this.openedFromProfile = fromProfile;

        // Load document
        const docSnap = await db.ref(`documents/${docId}`).once("value");
        if (!docSnap.exists()) {
            soundManager.play('alert');
            this.showToast("Document not found", "error");
            return;
        }

        const doc = docSnap.val();
        this.docTitle.value = doc.title || "";
        this.docContent.value = doc.content || "";
        this.docPrivacy.value = doc.privacy || "private";

        // Check if user can edit
        const canEdit = doc.authorId === this.currentUser.id;

        if (!canEdit) {
            // Read-only mode for other people's documents
            this.isReaderMode = true;
            this.docTitle.disabled = true;
            this.docContent.disabled = true;
            this.docPrivacy.disabled = true;
            this.saveDocBtn.disabled = true;
            this.deleteDocBtn.style.display = 'none';
            this.deleteDocBtnReader.style.display = 'none';
            this.modeToggleBtn.style.display = 'none';
        } else {
            // Editable for own documents
            this.isReaderMode = false;
            this.docTitle.disabled = false;
            this.docContent.disabled = false;
            this.docPrivacy.disabled = false;
            this.saveDocBtn.disabled = false;
            this.deleteDocBtn.style.display = 'block';
            this.deleteDocBtnReader.style.display = 'block';
            this.modeToggleBtn.style.display = 'inline-block';
        }

        soundManager.play('chomp');
        this.showEditorView();
    }

    showEditorView() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.remove("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        
        soundManager.play('bite');
        
        // Update back button text
        if (this.openedFromProfile) {
            this.backToHomeBtn.textContent = "Back to Profile";
        } else {
            this.backToHomeBtn.textContent = "Back to Home";
        }
        
        // Set up the correct mode
        if (this.isReaderMode) {
            this.editMode.classList.add("hidden");
            this.readerMode.classList.remove("hidden");
            this.modeToggleBtn.textContent = "Edit Mode";
            this.editorStatus.classList.add("hidden");
            this.renderReaderMode();
        } else {
            this.editMode.classList.remove("hidden");
            this.readerMode.classList.add("hidden");
            this.modeToggleBtn.textContent = "Reader Mode";
            this.editorStatus.classList.remove("hidden");
        }
    }

    toggleMode() {
        this.isReaderMode = !this.isReaderMode;
        this.showEditorView();
    }

    renderReaderMode() {
        const title = this.docTitle.value.trim() || "Untitled Document";
        const content = this.docContent.value;

        this.readerTitle.textContent = title;
        
        // Parse markdown to HTML
        if (typeof marked !== 'undefined') {
            this.readerContent.innerHTML = marked.parse(content);
        } else {
            // Fallback if marked.js doesn't load
            this.readerContent.innerHTML = content.replace(/\n/g, '<br>');
        }
    }

    closeEditor() {
        // Stop listening to documents if needed
        this.currentDocId = null;
        this.isReaderMode = false;
        
        // Clear editor
        this.docTitle.value = "";
        this.docContent.value = "";
        
        // Reset button visibility
        this.deleteDocBtn.style.display = 'block';
        this.deleteDocBtnReader.style.display = 'block';
        this.modeToggleBtn.style.display = 'inline-block';
        
        // Navigate back to where we came from
        if (this.openedFromProfile && this.currentProfileUserId) {
            this.openedFromProfile = false;
            this.showProfileView();
        } else {
            this.showHomeView();
        }
    }

    async saveDocument() {
        if (!this.currentDocId) return;

        const title = this.docTitle.value.trim() || "Untitled Document";
        const content = this.docContent.value;
        const privacy = this.docPrivacy.value;

        try {
            await db.ref(`documents/${this.currentDocId}`).update({
                title: title,
                content: content,
                privacy: privacy,
                updatedAt: Date.now(),
                "metadata/lastEditedBy": this.currentUser.id
            });

            soundManager.play('accepted');
            this.editorStatus.textContent = "Saved!";
            this.editorStatus.style.color = "#10b981";
            
            setTimeout(() => {
                this.editorStatus.textContent = "Editing...";
                this.editorStatus.style.color = "#64748b";
            }, 2000);
        } catch (err) {
            console.error("Failed to save document:", err);
            this.showToast("Failed to save document", "error");
        }
    }

    async autoSave() {
        if (!this.currentDocId) return;
        
        const title = this.docTitle.value.trim() || "Untitled Document";
        const content = this.docContent.value;
        const privacy = this.docPrivacy.value;

        try {
            await db.ref(`documents/${this.currentDocId}`).update({
                title: title,
                content: content,
                privacy: privacy,
                updatedAt: Date.now(),
                "metadata/lastEditedBy": this.currentUser.id
            });

            soundManager.play('reclick');
            this.editorStatus.textContent = "Auto-saved";
            this.editorStatus.style.color = "#10b981";
            
            setTimeout(() => {
                this.editorStatus.textContent = "Editing...";
                this.editorStatus.style.color = "#64748b";
            }, 1500);
        } catch (err) {
            console.error("Auto-save failed:", err);
        }
    }

    async deleteDocument() {
        if (!this.currentDocId) return;

        const confirmed = confirm("Are you sure you want to delete this document? This cannot be undone.");
        if (!confirmed) return;

        try {
            await db.ref(`documents/${this.currentDocId}`).remove();
            this.showToast("Document deleted", "success");
            this.closeEditor();
        } catch (err) {
            console.error("Failed to delete document:", err);
            this.showToast("Failed to delete document", "error");
        }
    }

    // ===== OBJECT TYPE METHODS =====

    listenToObjectTypes() {
        if (this.objectTypesListener) {
            db.ref(`objectTypes`).off("value", this.objectTypesListener);
        }

        this.objectTypesListener = db.ref(`objectTypes`)
            .orderByChild("authorId")
            .equalTo(this.currentUser.id)
            .on("value", snap => {
                this.renderObjectTypes(snap);
            });
    }

    renderObjectTypes(snap) {
        this.objectTypesList.innerHTML = "";

        if (!snap.exists()) {
            const emptyMsg = document.createElement("div");
            emptyMsg.className = "document-empty";
            emptyMsg.textContent = "No object types yet. Create one to get started!";
            this.objectTypesList.appendChild(emptyMsg);
            return;
        }

        snap.forEach(typeSnap => {
            const typeId = typeSnap.key;
            const type = typeSnap.val();
            this.renderObjectTypeCard(typeId, type);
        });
    }

    renderObjectTypeCard(typeId, type) {
        const card = document.createElement("div");
        card.className = "object-type-card";
        card.onclick = () => this.openObjectType(typeId);

        const name = document.createElement("div");
        name.className = "object-type-name";
        name.textContent = type.name || "Untitled Type";

        const fieldCount = type.fields ? Object.keys(type.fields).length : 0;
        const fields = document.createElement("div");
        fields.className = "object-type-fields";
        fields.textContent = `${fieldCount} ${fieldCount === 1 ? 'field' : 'fields'}`;

        card.appendChild(name);
        card.appendChild(fields);

        if (type.tags && type.tags.length > 0) {
            const tagsDiv = document.createElement("div");
            tagsDiv.className = "object-type-tags";
            type.tags.forEach(tag => {
                const tagSpan = document.createElement("span");
                tagSpan.className = "object-type-tag";
                tagSpan.textContent = tag;
                tagsDiv.appendChild(tagSpan);
            });
            card.appendChild(tagsDiv);
        }

        this.objectTypesList.appendChild(card);
    }

    createObjectType() {
        this.currentObjectTypeId = null;
        this.fieldIdCounter = 0;
        this.objectTypeName.value = "";
        this.objectTypeTags.value = "";
        this.fieldsList.innerHTML = "";
        this.deleteObjectTypeBtn.style.display = "none";
        this.objectTypeBuilderTitle.textContent = "New Object Type";
        this.showObjectTypeBuilder();
    }

    async openObjectType(typeId) {
        this.currentObjectTypeId = typeId;
        this.fieldIdCounter = 0;

        const typeSnap = await db.ref(`objectTypes/${typeId}`).once("value");
        if (!typeSnap.exists()) {
            this.showToast("Object type not found", "error");
            return;
        }

        const type = typeSnap.val();
        this.objectTypeName.value = type.name || "";
        this.objectTypeTags.value = type.tags ? type.tags.join(", ") : "";
        this.fieldsList.innerHTML = "";

        if (type.fields) {
            // Sort fields by order
            const fieldsArray = Object.entries(type.fields).map(([id, field]) => ({
                id,
                ...field
            }));
            fieldsArray.sort((a, b) => (a.order || 0) - (b.order || 0));

            fieldsArray.forEach(field => {
                this.renderField(field.id, field.name, field.type);
            });
        }

        this.deleteObjectTypeBtn.style.display = "block";
        this.objectTypeBuilderTitle.textContent = "Edit Object Type";
        this.showObjectTypeBuilder();
    }

    showObjectTypeBuilder() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.objectTypeBuilderView.classList.remove("hidden");

        soundManager.play('bite');
    }

    closeObjectTypeBuilder() {
        this.objectTypeBuilderView.classList.add("hidden");
        this.homeView.classList.remove("hidden");
        this.switchTab('toolkit');
    }

    addField() {
        const fieldId = `field_${Date.now()}_${this.fieldIdCounter++}`;
        this.renderField(fieldId, "", "text");
    }

    renderField(fieldId, fieldName = "", fieldType = "text") {
        const fieldDiv = document.createElement("div");
        fieldDiv.className = "field-item";
        fieldDiv.dataset.fieldId = fieldId;

        const dragHandle = document.createElement("div");
        dragHandle.className = "field-drag-handle";
        dragHandle.textContent = "⋮⋮";

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.className = "field-input";
        nameInput.placeholder = "Field name";
        nameInput.value = fieldName;
        nameInput.dataset.fieldId = fieldId;

        const typeSelect = document.createElement("select");
        typeSelect.className = "field-type-select";
        typeSelect.dataset.fieldId = fieldId;
        
        const types = [
            { value: "text", label: "Text" },
            { value: "number", label: "Number" },
            { value: "date", label: "Date" },
            { value: "boolean", label: "Yes/No" }
        ];
        
        types.forEach(type => {
            const option = document.createElement("option");
            option.value = type.value;
            option.textContent = type.label;
            if (type.value === fieldType) {
                option.selected = true;
            }
            typeSelect.appendChild(option);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "field-delete-btn";
        deleteBtn.textContent = "×";
        deleteBtn.onclick = () => this.removeField(fieldId);

        fieldDiv.appendChild(dragHandle);
        fieldDiv.appendChild(nameInput);
        fieldDiv.appendChild(typeSelect);
        fieldDiv.appendChild(deleteBtn);

        this.fieldsList.appendChild(fieldDiv);
    }

    removeField(fieldId) {
        const fieldDiv = this.fieldsList.querySelector(`[data-field-id="${fieldId}"]`);
        if (fieldDiv) {
            fieldDiv.remove();
        }
    }

    async saveObjectType() {
        const name = this.objectTypeName.value.trim();
        
        if (!name) {
            this.showToast("Please enter a type name", "error");
            return;
        }

        // Collect fields
        const fields = {};
        const fieldElements = this.fieldsList.querySelectorAll('.field-item');
        
        fieldElements.forEach((fieldEl, index) => {
            const fieldId = fieldEl.dataset.fieldId;
            const nameInput = fieldEl.querySelector('.field-input');
            const typeSelect = fieldEl.querySelector('.field-type-select');
            
            const fieldName = nameInput.value.trim();
            if (fieldName) {
                fields[fieldId] = {
                    name: fieldName,
                    type: typeSelect.value,
                    order: index
                };
            }
        });

        // Parse tags
        const tagsInput = this.objectTypeTags.value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

        const objectType = {
            name: name,
            fields: fields,
            tags: tags,
            authorId: this.currentUser.id,
            updatedAt: Date.now()
        };

        try {
            if (this.currentObjectTypeId) {
                // Update existing
                await db.ref(`objectTypes/${this.currentObjectTypeId}`).update(objectType);
                this.showToast("Object type updated", "success");
            } else {
                // Create new
                objectType.createdAt = Date.now();
                const newTypeRef = await db.ref("objectTypes").push(objectType);
                this.currentObjectTypeId = newTypeRef.key;
                this.showToast("Object type created", "success");
            }
            
            soundManager.play('accepted');
            this.closeObjectTypeBuilder();
        } catch (err) {
            console.error("Failed to save object type:", err);
            console.error("Error code:", err.code);
            console.error("Error message:", err.message);
            
            let errorMsg = "Failed to save object type";
            if (err.code === 'PERMISSION_DENIED') {
                errorMsg = "Permission denied. Please update Firebase security rules.";
            }
            
            this.showToast(errorMsg, "error");
        }
    }

    async deleteObjectType() {
        if (!this.currentObjectTypeId) return;

        const confirmed = confirm("Are you sure you want to delete this object type? This cannot be undone.");
        if (!confirmed) return;

        try {
            await db.ref(`objectTypes/${this.currentObjectTypeId}`).remove();
            this.showToast("Object type deleted", "success");
            this.closeObjectTypeBuilder();
        } catch (err) {
            console.error("Failed to delete object type:", err);
            this.showToast("Failed to delete object type", "error");
        }
    }

    // ===== USER & PROFILE METHODS =====

    listenToUsers() {
        if (this.usersListener) {
            db.ref("users").off("value", this.usersListener);
        }

        this.usersListener = db.ref("users").on("value", snap => {
            this.renderUsers(snap);
        });
    }

    renderUsers(snap) {
        this.usersList.innerHTML = "";

        if (!snap.exists()) {
            const emptyMsg = document.createElement("div");
            emptyMsg.className = "document-empty";
            emptyMsg.textContent = "No users yet.";
            this.usersList.appendChild(emptyMsg);
            return;
        }

        const users = [];
        snap.forEach(userSnap => {
            const userId = userSnap.key;
            if (userId !== this.currentUser.id) { // Don't show current user
                users.push({ id: userId, ...userSnap.val() });
            }
        });

        // Sort by most recent
        users.sort((a, b) => (b.lastLogin || b.createdAt) - (a.lastLogin || a.createdAt));

        users.forEach(user => {
            const userCard = document.createElement("div");
            userCard.className = "user-card";
            userCard.dataset.userId = user.id;
            userCard.dataset.name = user.name.toLowerCase();

            const userName = document.createElement("div");
            userName.className = "user-name";
            userName.textContent = user.name;

            const userMeta = document.createElement("div");
            userMeta.className = "user-meta";
            
            const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown";
            const key = user.key || "???";
            
            userMeta.innerHTML = `
                <span>Key: ${key}</span>
                <span>Joined: ${joined}</span>
            `;

            userCard.appendChild(userName);
            userCard.appendChild(userMeta);
            userCard.onclick = () => this.openProfile(user.id);

            this.usersList.appendChild(userCard);
        });
    }

    filterUsers(searchTerm) {
        const userCards = this.usersList.querySelectorAll('.user-card');
        
        userCards.forEach(card => {
            const name = card.dataset.name;
            if (name.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    async openProfile(userId) {
        this.currentProfileUserId = userId;

        // Load user data
        const userSnap = await db.ref(`users/${userId}`).once("value");
        if (!userSnap.exists()) {
            this.showToast("User not found", "error");
            return;
        }

        const user = userSnap.val();
        
        // Update profile UI
        this.profileName.textContent = user.name;
        this.profileKey.textContent = user.key;
        
        if (user.createdAt) {
            const date = new Date(user.createdAt);
            this.profileJoined.textContent = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            this.profileJoined.textContent = "Unknown";
        }

        // Load user's public documents
        const docsSnap = await db.ref("documents")
            .orderByChild("authorId")
            .equalTo(userId)
            .once("value");

        this.renderProfileDocuments(docsSnap);
        this.showProfileView();
    }

    renderProfileDocuments(snap) {
        this.profileDocsList.innerHTML = "";
        
        let publicCount = 0;

        if (snap.exists()) {
            snap.forEach(docSnap => {
                const doc = docSnap.val();
                
                // Only show public documents
                if (doc.privacy === "public") {
                    publicCount++;
                    const docId = docSnap.key;

                    const docCard = document.createElement("div");
                    docCard.className = "document-card";

                    const docTitle = document.createElement("div");
                    docTitle.className = "document-title";
                    docTitle.textContent = doc.title || "Untitled Document";

                    const docMeta = document.createElement("div");
                    docMeta.className = "document-meta";
                    
                    const updated = new Date(doc.updatedAt).toLocaleDateString();
                    docMeta.innerHTML = `<span>Updated: ${updated}</span>`;

                    docCard.appendChild(docTitle);
                    docCard.appendChild(docMeta);
                    docCard.onclick = () => this.openDocument(docId, true);

                    this.profileDocsList.appendChild(docCard);
                }
            });
        }

        this.profileDocCount.textContent = publicCount;

        if (publicCount === 0) {
            const emptyMsg = document.createElement("div");
            emptyMsg.className = "document-empty";
            emptyMsg.textContent = "No public documents yet.";
            this.profileDocsList.appendChild(emptyMsg);
        }
    }

    showProfileView() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.profileView.classList.remove("hidden");
        
        soundManager.play('bite');
    }

    closeProfile() {
        this.currentProfileUserId = null;
        this.showHomeView();
    }

    // ===== ACTIVITY & ROOM METHODS =====

    async joinRoom(roomCode) {
        if (this.currentRoomCode === roomCode) return;
        if (this.currentRoomCode) this.leaveRoom();

        this.currentRoomCode = roomCode;

        // Add player to room
        const playersRef = db.ref(`rooms/${roomCode}/players`);
        await playersRef.child(this.currentUser.id).set({
            name: this.currentUser.name,
            key: this.currentUser.key,
            joinedAt: Date.now()
        });

        // Set up disconnect handler
        playersRef.child(this.currentUser.id).onDisconnect().remove();

        // Show activity menu
        this.showActivityMenu();
    }

    showActivityMenu() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.activityMenuView.classList.remove("hidden");

        soundManager.play('bite');
        this.menuRoomCode.textContent = `Room: ${this.currentRoomCode}`;

        // Listen for players and activities
        this.listenToRoomPlayers();
        this.listenToActivities();
    }

    listenToRoomPlayers() {
        const playersRef = db.ref(`rooms/${this.currentRoomCode}/players`);
        
        if (this.playersListener) {
            playersRef.off("value", this.playersListener);
        }

        this.playersListener = playersRef.on("value", snap => {
            this.menuPlayerChips.innerHTML = "";
            
            snap.forEach(playerSnap => {
                const player = playerSnap.val();
                const chip = document.createElement("div");
                chip.className = "player-chip";
                chip.textContent = player.name;
                this.menuPlayerChips.appendChild(chip);
            });
        });
    }

    listenToActivities() {
        const activitiesRef = db.ref(`rooms/${this.currentRoomCode}/activities`);
        
        if (this.activitiesListener) {
            activitiesRef.off("value", this.activitiesListener);
        }

        this.activitiesListener = activitiesRef.on("value", snap => {
            this.renderActivities(snap);
        });
    }

    renderActivities(snap) {
        this.activitiesList.innerHTML = "";

        if (!snap.exists()) {
            const emptyMsg = document.createElement("div");
            emptyMsg.className = "document-empty";
            emptyMsg.textContent = "No activities yet. Start one!";
            this.activitiesList.appendChild(emptyMsg);
            return;
        }

        snap.forEach(activitySnap => {
            const activityId = activitySnap.key;
            const activity = activitySnap.val();

            const card = document.createElement("div");
            card.className = "activity-card";

            const header = document.createElement("div");
            header.className = "activity-card-header";

            const name = document.createElement("div");
            name.className = "activity-name";
            name.textContent = activity.type === "chat" ? "Chat" : 
                              activity.type === "quick_draw" ? "Quick Draw" :
                              activity.type === "dice" ? "Dice Roller" :
                              activity.type === "collab_doc" ? "Collaborative Story" : "Activity";

            const count = document.createElement("div");
            count.className = "activity-count";
            const activeCount = activity.activeUsers ? Object.keys(activity.activeUsers).length : 0;
            count.textContent = `${activeCount} ${activeCount === 1 ? 'person' : 'people'}`;

            header.appendChild(name);
            header.appendChild(count);

            const status = document.createElement("div");
            status.className = "activity-status";
            status.textContent = activeCount > 0 ? "Active" : "No one here";

            card.appendChild(header);
            card.appendChild(status);
            card.onclick = () => this.joinActivity(activityId, activity.type);

            this.activitiesList.appendChild(card);
        });
    }

    showActivityCreator() {
        this.activityCreatorModal.classList.remove("hidden");
        
        // Add click handlers to activity options
        const options = this.activityCreatorModal.querySelectorAll('.activity-option');
        options.forEach(option => {
            option.onclick = () => {
                const type = option.dataset.type;
                this.createActivity(type);
            };
        });
    }

    hideActivityCreator() {
        this.activityCreatorModal.classList.add("hidden");
    }

    async createActivity(type) {
        this.hideActivityCreator();

        const activityId = this.generateId();
        const activityRef = db.ref(`rooms/${this.currentRoomCode}/activities/${activityId}`);

        const activityData = {
            type: type,
            createdAt: Date.now(),
            createdBy: this.currentUser.id,
            activeUsers: {}
        };

        // Initialize type-specific data
        if (type === "quick_draw") {
            activityData.gameState = {
                active: false,
                round: 1,
                state: "waiting",
                scores: {}
            };
        }

        await activityRef.set(activityData);
        this.joinActivity(activityId, type);
    }

    async joinActivity(activityId, type) {
        this.currentActivityId = activityId;

        // Add user to activity
        const activityRef = db.ref(`rooms/${this.currentRoomCode}/activities/${activityId}`);
        await activityRef.child(`activeUsers/${this.currentUser.id}`).set({
            name: this.currentUser.name,
            joinedAt: Date.now()
        });

        // Set up disconnect handler
        activityRef.child(`activeUsers/${this.currentUser.id}`).onDisconnect().remove();

        // Show appropriate view based on type
        if (type === "chat") {
            this.showChatView();
        } else if (type === "dice") {
            this.showDiceView();
        } else if (type === "collab_doc") {
            this.showCollabDocView();
        } else if (type === "quick_draw") {
            this.showGameView();
        }
    }

    async leaveActivity() {
        if (!this.currentActivityId) return;

        // Remove user from activity
        const activityRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}`);
        await activityRef.child(`activeUsers/${this.currentUser.id}`).remove();

        // Stop listening
        if (this.chatListener) {
            activityRef.child("messages").off("child_added", this.chatListener);
            this.chatListener = null;
            this.chatInitialLoadComplete = false;
        }

        if (this.diceListener) {
            activityRef.child("rolls").off("child_added", this.diceListener);
            this.diceListener = null;
            this.diceInitialLoadComplete = false;
        }

        if (this.collabDocListener) {
            activityRef.child("document").off("value", this.collabDocListener);
            this.collabDocListener = null;
        }

        if (this.collabEditorsListener) {
            activityRef.child("activeUsers").off("value", this.collabEditorsListener);
            this.collabEditorsListener = null;
        }

        if (this.storyTurnListener) {
            activityRef.child("turn").off("value", this.storyTurnListener);
            this.storyTurnListener = null;
        }

        if (this.storyUsersListener) {
            activityRef.child("activeUsers").off("value", this.storyUsersListener);
            this.storyUsersListener = null;
        }

        if (this.storyBlocksListener) {
            activityRef.child("blocks").off("child_added", this.storyBlocksListener);
            this.storyBlocksListener = null;
        }

        if (this.gameListener) {
            activityRef.child("gameState").off("value", this.gameListener);
            this.gameListener = null;
        }

        this.currentActivityId = null;

        // Return to activity menu
        this.showActivityMenu();
    }

    leaveRoom() {
        if (!this.currentRoomCode) return;

        const roomCode = this.currentRoomCode;

        // Leave activity if in one
        if (this.currentActivityId) {
            const activityRef = db.ref(`rooms/${roomCode}/activities/${this.currentActivityId}`);
            activityRef.child(`activeUsers/${this.currentUser.id}`).remove();
        }

        // Remove player from room
        const playersRef = db.ref(`rooms/${roomCode}/players/${this.currentUser.id}`);
        playersRef.remove();

        // Stop all listeners
        if (this.playersListener) {
            db.ref(`rooms/${roomCode}/players`).off("value", this.playersListener);
            this.playersListener = null;
        }

        if (this.activitiesListener) {
            db.ref(`rooms/${roomCode}/activities`).off("value", this.activitiesListener);
            this.activitiesListener = null;
        }

        if (this.chatListener) {
            this.chatListener = null;
        }

        if (this.gameListener) {
            this.gameListener = null;
        }

        this.currentRoomCode = null;
        this.currentActivityId = null;
        
        // Return to home
        this.showHomeView();
    }

    // ===== CHAT METHODS =====

    showChatView() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.chatView.classList.remove("hidden");

        soundManager.play('bite');
        this.chatRoomCode.textContent = this.currentRoomCode;
        this.chatMessages.innerHTML = "";

        // Listen for messages
        this.listenToChatMessages();
    }

    listenToChatMessages() {
        const messagesRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/messages`);
        
        if (this.chatListener) {
            messagesRef.off("child_added", this.chatListener);
        }

        // Reset flag for new room
        this.chatInitialLoadComplete = false;

        // First, load existing messages silently
        messagesRef.limitToLast(100).once("value", snap => {
            // Render all existing messages without sound
            snap.forEach(msgSnap => {
                const message = msgSnap.val();
                this.renderChatMessage(message, true); // true = silent (no sound)
            });
            
            // Mark initial load as complete
            this.chatInitialLoadComplete = true;
        });

        // Then listen for new messages
        this.chatListener = messagesRef.limitToLast(1).on("child_added", snap => {
            // Skip if this is part of initial load
            if (!this.chatInitialLoadComplete) return;
            
            const message = snap.val();
            this.renderChatMessage(message, false); // false = play sound
        });
    }

    renderChatMessage(message, silent = false) {
        const msgDiv = document.createElement("div");
        msgDiv.className = "chat-message";

        // Check if this is from the same user as the last message
        const lastMessage = this.chatMessages.lastElementChild;
        const isSameUser = lastMessage && lastMessage.dataset.userId === message.userId;

        // Store userId on the element
        msgDiv.dataset.userId = message.userId;

        // Play sound for incoming messages from others (only if not silent)
        if (!silent && message.userId !== this.currentUser.id) {
            soundManager.play('keyboard');
        }

        if (isSameUser) {
            // Grouped message - no name/timestamp
            msgDiv.classList.add("grouped");
        } else {
            // New message group - show name and timestamp
            const headerDiv = document.createElement("div");
            headerDiv.className = "chat-message-header";

            const nameDiv = document.createElement("div");
            nameDiv.className = "chat-message-name";
            nameDiv.textContent = message.name;

            const timeDiv = document.createElement("div");
            timeDiv.className = "chat-message-time";
            const date = new Date(message.timestamp);
            timeDiv.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            headerDiv.appendChild(nameDiv);
            headerDiv.appendChild(timeDiv);
            msgDiv.appendChild(headerDiv);
        }

        const textDiv = document.createElement("div");
        textDiv.className = "chat-message-text";
        textDiv.textContent = message.text;

        msgDiv.appendChild(textDiv);
        this.chatMessages.appendChild(msgDiv);
        
        // Scroll to bottom
        const container = this.chatMessages.parentElement;
        container.scrollTop = container.scrollHeight;
    }

    async sendChatMessage() {
        const text = this.chatInput.value.trim();
        if (!text) return;

        const messagesRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/messages`);
        
        await messagesRef.push({
            userId: this.currentUser.id,
            name: this.currentUser.name,
            text: text,
            timestamp: Date.now()
        });

        soundManager.play('submitted');
        this.chatInput.value = "";
    }

    // ===== DICE METHODS =====

    showDiceView() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.diceView.classList.remove("hidden");

        soundManager.play('bite');
        this.diceRoomCode.textContent = this.currentRoomCode;
        this.diceRolls.innerHTML = "";

        // Listen for dice rolls
        this.listenToDiceRolls();
    }

    listenToDiceRolls() {
        const rollsRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/rolls`);
        
        if (this.diceListener) {
            rollsRef.off("child_added", this.diceListener);
        }

        // Reset flag for new room
        this.diceInitialLoadComplete = false;

        // First, load existing rolls silently
        rollsRef.limitToLast(50).once("value", snap => {
            // Render all existing rolls without sound
            snap.forEach(rollSnap => {
                const roll = rollSnap.val();
                this.renderDiceRoll(roll, true); // true = silent (no sound)
            });
            
            // Mark initial load as complete
            this.diceInitialLoadComplete = true;
        });

        // Then listen for new rolls
        this.diceListener = rollsRef.limitToLast(1).on("child_added", snap => {
            // Skip if this is part of initial load
            if (!this.diceInitialLoadComplete) return;
            
            const roll = snap.val();
            this.renderDiceRoll(roll, false); // false = play sound
        });
    }

    renderDiceRoll(roll, silent = false) {
        const rollDiv = document.createElement("div");
        rollDiv.className = "dice-roll";

        const headerDiv = document.createElement("div");
        headerDiv.className = "dice-roll-header";

        const nameDiv = document.createElement("div");
        nameDiv.className = "dice-roll-name";
        nameDiv.textContent = roll.name;

        const timeDiv = document.createElement("div");
        timeDiv.className = "dice-roll-time";
        const date = new Date(roll.timestamp);
        timeDiv.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        headerDiv.appendChild(nameDiv);
        headerDiv.appendChild(timeDiv);

        const resultDiv = document.createElement("div");
        resultDiv.className = "dice-roll-result";

        const typeDiv = document.createElement("div");
        typeDiv.className = "dice-roll-type";
        typeDiv.textContent = `d${roll.sides}`;

        const valueDiv = document.createElement("div");
        valueDiv.className = "dice-roll-value";
        valueDiv.textContent = roll.value;

        // Highlight critical and fumbles
        if (roll.value === roll.sides) {
            valueDiv.classList.add("dice-roll-critical");
        } else if (roll.value === 1) {
            valueDiv.classList.add("dice-roll-fumble");
        }

        resultDiv.appendChild(typeDiv);
        resultDiv.appendChild(valueDiv);

        rollDiv.appendChild(headerDiv);
        rollDiv.appendChild(resultDiv);

        this.diceRolls.insertBefore(rollDiv, this.diceRolls.firstChild);

        // Play sound for incoming rolls from others
        if (!silent && roll.userId !== this.currentUser.id) {
            soundManager.play('keyboard');
        }
        
        // Scroll to top to see new roll
        const container = this.diceRolls.parentElement;
        container.scrollTop = 0;
    }

    async rollDice(sides) {
        const rollsRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/rolls`);
        
        const value = Math.floor(Math.random() * sides) + 1;

        await rollsRef.push({
            userId: this.currentUser.id,
            name: this.currentUser.name,
            sides: sides,
            value: value,
            timestamp: Date.now()
        });

        soundManager.play('submitted');
    }

    // ===== COLLABORATIVE STORY METHODS =====

    showCollabDocView() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.collabDocView.classList.remove("hidden");

        soundManager.play('bite');
        this.collabDocRoomCode.textContent = this.currentRoomCode;
        
        // Clear input and blocks
        this.yourTurnInput.value = "";
        this.charCount.textContent = "0 / 500";
        this.storyBlocks.innerHTML = "";

        // Listen for turn updates and blocks
        this.listenToStoryTurn();
        this.listenToStoryBlocks();
    }

    listenToStoryTurn() {
        const turnRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/turn`);
        const usersRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/activeUsers`);
        
        if (this.storyTurnListener) {
            turnRef.off("value", this.storyTurnListener);
        }
        
        if (this.storyUsersListener) {
            usersRef.off("value", this.storyUsersListener);
        }

        // Listen for changes in active users to update turn order
        this.storyUsersListener = usersRef.on("value", async (usersSnap) => {
            if (!usersSnap.exists()) return;
            
            const activeUsers = [];
            usersSnap.forEach(userSnap => {
                activeUsers.push({
                    id: userSnap.key,
                    name: userSnap.val().name
                });
            });
            
            // Check if turn exists
            const turnSnap = await turnRef.once("value");
            const turn = turnSnap.val();
            
            if (!turn) {
                // Initialize turn if it doesn't exist
                await this.initializeTurn(activeUsers);
            } else {
                // Update turn order to include all active users
                const currentTurnOrder = turn.turnOrder || [];
                const activeUserIds = activeUsers.map(u => u.id);
                
                // Add new users to turn order
                const newTurnOrder = [...currentTurnOrder];
                activeUsers.forEach(user => {
                    if (!newTurnOrder.includes(user.id)) {
                        newTurnOrder.push(user.id);
                    }
                });
                
                // Remove inactive users from turn order
                const filteredTurnOrder = newTurnOrder.filter(id => activeUserIds.includes(id));
                
                // If turn order changed, update it
                if (JSON.stringify(filteredTurnOrder) !== JSON.stringify(currentTurnOrder)) {
                    await turnRef.update({
                        turnOrder: filteredTurnOrder
                    });
                    
                    // If current player is no longer active, advance turn
                    if (!activeUserIds.includes(turn.currentPlayer)) {
                        await this.advanceTurn();
                    }
                }
            }
        });

        this.storyTurnListener = turnRef.on("value", snap => {
            const turn = snap.val();
            
            if (!turn || !turn.currentPlayer) {
                return;
            }
            
            // Update turn display
            this.turnPlayer.textContent = turn.currentPlayerName;
            
            // Show/hide input based on whose turn it is
            if (turn.currentPlayer === this.currentUser.id) {
                this.yourTurnSection.classList.remove("hidden");
                this.waitingTurnSection.classList.add("hidden");
                this.turnPlayer.textContent = "Your turn!";
                this.turnPlayer.style.color = "#10b981";
            } else {
                this.yourTurnSection.classList.add("hidden");
                this.waitingTurnSection.classList.remove("hidden");
                this.waitingText.textContent = `Waiting for ${turn.currentPlayerName}...`;
                this.turnPlayer.style.color = "#3b82f6";
            }
        });
    }

    async initializeTurn(activeUsers) {
        if (!activeUsers || activeUsers.length === 0) {
            // Get active users if not provided
            const usersSnap = await db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/activeUsers`).once("value");
            
            if (!usersSnap.exists()) return;
            
            activeUsers = [];
            usersSnap.forEach(userSnap => {
                activeUsers.push({
                    id: userSnap.key,
                    name: userSnap.val().name
                });
            });
        }
        
        if (activeUsers.length === 0) return;
        
        // Set first user as current turn
        const turnRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/turn`);
        await turnRef.set({
            currentPlayer: activeUsers[0].id,
            currentPlayerName: activeUsers[0].name,
            turnOrder: activeUsers.map(u => u.id),
            turnIndex: 0
        });
    }

    listenToStoryBlocks() {
        const blocksRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/blocks`);
        
        if (this.storyBlocksListener) {
            blocksRef.off("child_added", this.storyBlocksListener);
        }

        // Load existing blocks
        blocksRef.limitToLast(50).once("value", snap => {
            snap.forEach(blockSnap => {
                const block = blockSnap.val();
                this.renderStoryBlock(block);
            });
        });

        // Listen for new blocks
        this.storyBlocksListener = blocksRef.limitToLast(1).on("child_added", snap => {
            const block = snap.val();
            // Check if this block is already rendered (from initial load)
            const existingBlock = Array.from(this.storyBlocks.children).find(
                el => el.dataset.blockId === snap.key
            );
            
            if (!existingBlock) {
                this.renderStoryBlock(block);
                
                // Play sound for new blocks from others
                if (block.userId !== this.currentUser.id) {
                    soundManager.play('keyboard');
                }
            }
        });
    }

    renderStoryBlock(block) {
        const blockDiv = document.createElement("div");
        blockDiv.className = block.passed ? "story-block story-block-pass" : "story-block";
        blockDiv.dataset.blockId = block.timestamp; // Use timestamp as ID

        const headerDiv = document.createElement("div");
        headerDiv.className = "story-block-header";

        const authorDiv = document.createElement("div");
        authorDiv.className = "story-block-author";
        authorDiv.textContent = block.passed ? `${block.name} passed` : block.name;

        const timeDiv = document.createElement("div");
        timeDiv.className = "story-block-time";
        const date = new Date(block.timestamp);
        timeDiv.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        headerDiv.appendChild(authorDiv);
        headerDiv.appendChild(timeDiv);

        const textDiv = document.createElement("div");
        textDiv.className = "story-block-text";
        textDiv.textContent = block.text || "(passed their turn)";

        blockDiv.appendChild(headerDiv);
        blockDiv.appendChild(textDiv);

        this.storyBlocks.appendChild(blockDiv);
        
        // Scroll to bottom
        const container = this.storyBlocks.parentElement;
        container.scrollTop = container.scrollHeight;
    }

    async submitStoryBlock() {
        const text = this.yourTurnInput.value.trim();
        
        if (!text) {
            this.showToast("Please write something before submitting", "error");
            return;
        }
        
        // Verify it's actually our turn before submitting
        const turnRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/turn`);
        const turnSnap = await turnRef.once("value");
        const turn = turnSnap.val();
        
        if (!turn || turn.currentPlayer !== this.currentUser.id) {
            this.showToast("It's not your turn!", "error");
            return;
        }
        
        // Disable submit button to prevent double submission
        this.submitBlockBtn.disabled = true;
        
        const blocksRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/blocks`);
        
        await blocksRef.push({
            userId: this.currentUser.id,
            name: this.currentUser.name,
            text: text,
            timestamp: Date.now(),
            passed: false
        });

        soundManager.play('submitted');
        this.yourTurnInput.value = "";
        this.charCount.textContent = "0 / 500";
        
        // Advance turn
        await this.advanceTurn();
        
        // Re-enable button after turn advances
        this.submitBlockBtn.disabled = false;
    }

    async passTurn() {
        // Verify it's actually our turn
        const turnRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/turn`);
        const turnSnap = await turnRef.once("value");
        const turn = turnSnap.val();
        
        if (!turn || turn.currentPlayer !== this.currentUser.id) {
            this.showToast("It's not your turn!", "error");
            return;
        }
        
        // Disable pass button to prevent double pass
        this.passBtn.disabled = true;
        
        const blocksRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/blocks`);
        
        await blocksRef.push({
            userId: this.currentUser.id,
            name: this.currentUser.name,
            text: "",
            timestamp: Date.now(),
            passed: true
        });

        soundManager.play('bite');
        
        // Advance turn
        await this.advanceTurn();
        
        // Re-enable button after turn advances
        this.passBtn.disabled = false;
    }

    async advanceTurn() {
        const turnRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/turn`);
        const turnSnap = await turnRef.once("value");
        const turn = turnSnap.val();
        
        if (!turn) return;
        
        // Get current active users
        const usersSnap = await db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/activeUsers`).once("value");
        const activeUserIds = [];
        usersSnap.forEach(userSnap => {
            activeUserIds.push(userSnap.key);
        });
        
        // Find next user in turn order who is still active
        let nextIndex = (turn.turnIndex + 1) % turn.turnOrder.length;
        let attempts = 0;
        
        while (attempts < turn.turnOrder.length) {
            const nextUserId = turn.turnOrder[nextIndex];
            
            if (activeUserIds.includes(nextUserId)) {
                // Found next active user
                const nextUserSnap = await db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/activeUsers/${nextUserId}`).once("value");
                const nextUser = nextUserSnap.val();
                
                await turnRef.update({
                    currentPlayer: nextUserId,
                    currentPlayerName: nextUser.name,
                    turnIndex: nextIndex
                });
                return;
            }
            
            nextIndex = (nextIndex + 1) % turn.turnOrder.length;
            attempts++;
        }
        
        // If we get here, no active users found - reinitialize
        await this.initializeTurn();
    }

    // ===== GAME METHODS =====

    showGameView() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.remove("hidden");

        soundManager.play('bite');
        this.gameRoomCode.textContent = this.currentRoomCode;

        // Listen for game updates
        this.listenToGame();
    }

    listenToGame() {
        if (!this.currentRoomCode || !this.currentActivityId) return;

        const gameRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/gameState`);

        if (this.gameListener) {
            gameRef.off("value", this.gameListener);
        }

        this.gameListener = gameRef.on("value", snap => {
            if (!snap.exists()) {
                return;
            }

            const game = snap.val();
            
            // Check if user is playing
            const isPlaying = game.playerStatus && game.playerStatus[this.currentUser.id] === "playing";
            
            // Update button state
            if (!isPlaying) {
                this.gameButton.disabled = true;
                this.gameButton.style.opacity = "0.5";
            } else {
                this.gameButton.disabled = false;
                this.gameButton.style.opacity = "1";
            }
            
            this.updateGameUI(game, isPlaying);
            this.updateScoreboard(game.scores || {});
            
            // Start first round if we're the initiator
            if (isPlaying && !game.roundInitiator && game.state === "waiting") {
                gameRef.child("roundInitiator").set(this.currentUser.id);
                this.startRound();
            }
        });
    }

    updateGameUI(game, isPlaying) {
        this.gameArea.className = "game-area";

        if (game.state === "waiting") {
            this.gameArea.classList.add("waiting");
            this.gamePrompt.textContent = "Get ready...";
            
            if (isPlaying) {
                this.gameStatus.textContent = `Round ${game.round} starting soon...`;
                this.gameButton.textContent = "WAIT";
                this.gameButton.disabled = false;
            } else {
                this.gameStatus.textContent = `Round ${game.round} - You are watching`;
                this.gameButton.disabled = true;
            }
            
            this.gameButton.classList.remove("ready");
            
        } else if (game.state === "ready") {
            this.gameArea.classList.add("ready");
            this.gamePrompt.textContent = "DRAW NOW!";
            
            if (isPlaying) {
                this.gameStatus.textContent = "Click as fast as you can!";
                this.gameButton.textContent = "DRAW!";
                this.gameButton.disabled = false;
            } else {
                this.gameStatus.textContent = "Players are racing!";
                this.gameButton.disabled = true;
            }
            
            this.gameButton.classList.add("ready");
            this.roundStartTime = game.roundStartTime;
            
        } else if (game.state === "finished") {
            this.gameButton.disabled = true;
            this.gameButton.classList.remove("ready");
            
            if (game.lastResult) {
                if (game.lastResult.tooEarly) {
                    this.gameArea.classList.add("too-early");
                    this.gamePrompt.textContent = "Too Early!";
                    this.gameStatus.textContent = `${game.lastResult.name} clicked too early!`;
                } else {
                    this.gamePrompt.textContent = `${game.lastResult.name} wins!`;
                    this.gameStatus.textContent = `Reaction time: ${game.lastResult.time}ms`;
                }
            }
        }
    }

    updateScoreboard(scores) {
        this.scoreboard.innerHTML = "";

        if (!scores || Object.keys(scores).length === 0) {
            this.scoreboard.innerHTML = "<div style='text-align: center; color: #94a3b8; padding: 20px;'>No players yet</div>";
            return;
        }

        // Convert to array and sort by points
        const scoreArray = Object.entries(scores).map(([id, data]) => ({
            id,
            name: data.name || "Unknown",
            points: data.points || 0
        })).sort((a, b) => b.points - a.points);

        scoreArray.forEach((score, index) => {
            const scoreItem = document.createElement("div");
            scoreItem.className = "score-item";
            
            if (index === 0 && score.points > 0) {
                scoreItem.classList.add("first-place");
            }

            const scoreName = document.createElement("div");
            scoreName.className = "score-name";
            scoreName.textContent = `${index + 1}. ${score.name}`;
            if (score.id === this.currentUser.id) {
                scoreName.textContent += " (you)";
            }

            const scorePoints = document.createElement("div");
            scorePoints.className = "score-points";
            scorePoints.textContent = `${score.points} pts`;

            scoreItem.appendChild(scoreName);
            scoreItem.appendChild(scorePoints);
            this.scoreboard.appendChild(scoreItem);
        });
    }

    async startRound() {
        if (!this.currentRoomCode || !this.currentActivityId) return;

        const gameRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/gameState`);

        // Check if we're still the round initiator
        const initiatorSnap = await gameRef.child("roundInitiator").once("value");
        if (initiatorSnap.val() !== this.currentUser.id) {
            return; // Someone else is managing rounds
        }

        // Wait random time (2-5 seconds)
        const waitTime = 2000 + Math.random() * 3000;

        await gameRef.update({ 
            state: "waiting",
            lastResult: null
        });

        setTimeout(async () => {
            const roundStartTime = Date.now();
            await gameRef.update({
                state: "ready",
                roundStartTime: roundStartTime
            });
        }, waitTime);
    }

    async handleGameClick() {
        if (!this.currentRoomCode || !this.currentActivityId) return;

        const gameRef = db.ref(`rooms/${this.currentRoomCode}/activities/${this.currentActivityId}/gameState`);
        const gameSnap = await gameRef.once("value");
        const game = gameSnap.val();

        // Check if player is playing
        if (!game.playerStatus || game.playerStatus[this.currentUser.id] !== "playing") {
            return; // Watchers can't click
        }

        if (!game || game.state === "finished") {
            return; // Round already over
        }

        if (game.state === "waiting") {
            // Clicked too early!
            await gameRef.update({
                state: "finished",
                lastResult: {
                    id: this.currentUser.id,
                    name: this.currentUser.name,
                    tooEarly: true
                }
            });

            // Deduct point
            const currentPoints = game.scores?.[this.currentUser.id]?.points || 0;
            await gameRef.child(`scores/${this.currentUser.id}`).update({
                points: Math.max(0, currentPoints - 1)
            });

            // Next round after delay
            setTimeout(async () => {
                await gameRef.child("round").transaction(round => (round || 0) + 1);
                this.startRound();
            }, 2500);

        } else if (game.state === "ready") {
            // Valid click!
            const reactionTime = Date.now() - game.roundStartTime;

            await gameRef.update({
                state: "finished",
                lastResult: {
                    id: this.currentUser.id,
                    name: this.currentUser.name,
                    time: reactionTime,
                    tooEarly: false
                }
            });

            // Award point
            const currentPoints = game.scores?.[this.currentUser.id]?.points || 0;
            await gameRef.child(`scores/${this.currentUser.id}`).update({
                points: currentPoints + 1
            });

            // Next round after delay
            setTimeout(async () => {
                await gameRef.child("round").transaction(round => (round || 0) + 1);
                this.startRound();
            }, 2500);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Initialize App
window.addEventListener("DOMContentLoaded", () => {
    window.app = new App();
});
