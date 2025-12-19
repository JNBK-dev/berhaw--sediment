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
        
        console.log("Home DOM elements:", {
            homeView: this.homeView,
            homePlayerName: this.homePlayerName,
            homePlayerKey: this.homePlayerKey
        });
        
        // Tab navigation
        this.writeTab = document.getElementById("writeTab");
        this.playTab = document.getElementById("playTab");
        this.peopleTab = document.getElementById("peopleTab");
        this.settingsTab = document.getElementById("settingsTab");
        this.writeSection = document.getElementById("writeSection");
        this.playSection = document.getElementById("playSection");
        this.peopleSection = document.getElementById("peopleSection");
        this.settingsSection = document.getElementById("settingsSection");
        
        // Write section
        this.documentsList = document.getElementById("documentsList");
        this.createDocBtn = document.getElementById("createDocBtn");
        
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
        this.logoutBtn = document.getElementById("logoutBtn");

        // DOM elements - Profile View
        this.profileView = document.getElementById("profileView");
        this.profileName = document.getElementById("profileName");
        this.profileKey = document.getElementById("profileKey");
        this.profileJoined = document.getElementById("profileJoined");
        this.profileDocCount = document.getElementById("profileDocCount");
        this.profileDocsList = document.getElementById("profileDocsList");
        this.backFromProfileBtn = document.getElementById("backFromProfileBtn");

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
        this.roundStartTime = null;

        // Bind events
        this.loginBtn.onclick = () => this.handleLogin();
        this.quickPlayBtn.onclick = () => this.handleQuickPlay();
        this.logoutBtn.onclick = () => this.handleLogout();
        
        // Tab navigation
        this.writeTab.onclick = () => this.switchTab('write');
        this.playTab.onclick = () => this.switchTab('play');
        this.peopleTab.onclick = () => this.switchTab('people');
        this.settingsTab.onclick = () => this.switchTab('settings');
        
        // Profile navigation
        this.backFromProfileBtn.onclick = () => this.closeProfile();
        
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
            
            this.showToast(`Welcome back, ${foundUser.name}!`, "success");
            this.showHomeView();
        } else {
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
            
            this.showToast(`Account created! Your key is: ${key}`, "success", 5000);
            this.showHomeView();
        } catch (err) {
            console.error("Failed to create user:", err);
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
        this.gameView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        
        // Stop listening to rooms
        db.ref("rooms").off();
    }

    showHomeView() {
        console.log("showHomeView called", this.currentUser);
        
        this.authView.classList.add("hidden");
        this.homeView.classList.remove("hidden");
        this.editorView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        
        if (!this.currentUser) {
            console.error("showHomeView called but currentUser is null!");
            this.showAuthView();
            return;
        }
        
        // Update UI
        console.log("Setting name/key:", this.currentUser.name, this.currentUser.key);
        this.homePlayerName.textContent = this.currentUser.name;
        this.homePlayerKey.textContent = this.currentUser.key;
        
        // Populate settings
        this.settingsName.textContent = this.currentUser.name;
        this.settingsKey.textContent = this.currentUser.key;
        
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
        this.playTab.classList.remove('active');
        this.peopleTab.classList.remove('active');
        this.settingsTab.classList.remove('active');
        
        // Hide all sections
        this.writeSection.classList.add('hidden');
        this.playSection.classList.add('hidden');
        this.peopleSection.classList.add('hidden');
        this.settingsSection.classList.add('hidden');
        
        // Show selected tab and section
        if (tabName === 'write') {
            this.writeTab.classList.add('active');
            this.writeSection.classList.remove('hidden');
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

        this.showEditorView();
    }

    showEditorView() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.remove("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        
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
        this.gameView.classList.add("hidden");
        this.profileView.classList.remove("hidden");
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
        this.chatView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.activityMenuView.classList.remove("hidden");

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
                              activity.type === "quick_draw" ? "Quick Draw" : "Activity";

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
        this.activityMenuView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.chatView.classList.remove("hidden");

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

        this.chatListener = messagesRef.limitToLast(100).on("child_added", snap => {
            const message = snap.val();
            this.renderChatMessage(message);
        });
    }

    renderChatMessage(message) {
        const msgDiv = document.createElement("div");
        msgDiv.className = "chat-message";

        const nameDiv = document.createElement("div");
        nameDiv.className = "chat-message-name";
        nameDiv.textContent = message.name;

        const textDiv = document.createElement("div");
        textDiv.className = "chat-message-text";
        textDiv.textContent = message.text;

        const timeDiv = document.createElement("div");
        timeDiv.className = "chat-message-time";
        const date = new Date(message.timestamp);
        timeDiv.textContent = date.toLocaleTimeString();

        msgDiv.appendChild(nameDiv);
        msgDiv.appendChild(textDiv);
        msgDiv.appendChild(timeDiv);

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

        this.chatInput.value = "";
    }

    // ===== GAME METHODS =====

    showGameView() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.gameView.classList.remove("hidden");

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
