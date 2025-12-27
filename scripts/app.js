// ============================================
// DATA VISUALIZER CLASS
// Clean, modern visualization module
// ============================================

class DataVisualizer {
    constructor() {
        // DOM REFERENCES (immutable, grouped)
        this.dom = {
            panel: null,
            closeBtn: null,
            controls: {
                chartType: null,
                xAxis: null,
                yAxis: null,
                aggregation: null
            },
            canvas: null,
            stats: null
        };
        
        // STATE (mutable, single dedicated object)
        this.state = {
            chart: null,              // Chart.js instance
            instances: [],            // Data array
            objectType: null,         // Field metadata
            currentConfig: {          // Current selections
                chartType: 'line',
                xFieldId: null,
                yFieldId: null,
                aggregation: 'none'
            },
            isVisible: false,         // Panel visibility
            cache: {                  // Performance caches
                relationships: {}     // Relationship ID -> display name
            }
        };
        
        this._initDOM();
        this._bindEvents();
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    _initDOM() {
        this.dom.panel = document.getElementById('inlineVizPanel');
        this.dom.closeBtn = document.getElementById('closeInlineVizBtn');
        this.dom.controls.chartType = document.getElementById('inlineChartType');
        this.dom.controls.xAxis = document.getElementById('inlineXAxis');
        this.dom.controls.yAxis = document.getElementById('inlineYAxis');
        this.dom.controls.aggregation = document.getElementById('inlineAggregation');
        this.dom.canvas = document.getElementById('inlineChart');
        this.dom.stats = document.getElementById('inlineStats');
    }
    
    _bindEvents() {
        // Close button
        this.dom.closeBtn.onclick = () => this.hide();
        
        // Real-time updates on ANY control change (THE MAGIC!)
        this.dom.controls.chartType.onchange = () => {
            this.state.currentConfig.chartType = this.dom.controls.chartType.value;
            this._updateChart();
        };
        
        this.dom.controls.xAxis.onchange = () => {
            this.state.currentConfig.xFieldId = this.dom.controls.xAxis.value;
            this._updateChart();
        };
        
        this.dom.controls.yAxis.onchange = () => {
            this.state.currentConfig.yFieldId = this.dom.controls.yAxis.value;
            this._updateChart();
        };
        
        this.dom.controls.aggregation.onchange = () => {
            this.state.currentConfig.aggregation = this.dom.controls.aggregation.value;
            this._updateChart();
        };
    }
    
    // ============================================
    // PUBLIC API
    // ============================================
    
    show() {
        this.state.isVisible = true;
        this.dom.panel.classList.remove('hidden');
        soundManager.play('bite');
    }
    
    hide() {
        this.state.isVisible = false;
        this.dom.panel.classList.add('hidden');
        this._cleanupChart();
    }
    
    setData(instances, objectType) {
        this.state.instances = instances;
        this.state.objectType = objectType;
        this.state.cache.relationships = {}; // Clear cache
        this._populateControls();
        this._updateChart();
    }
    
    destroy() {
        this._cleanupChart();
        this.state = null;
        this.dom = null;
    }
    
    // ============================================
    // PRIVATE METHODS - CONTROL POPULATION
    // ============================================
    
    _populateControls() {
        // Clear existing options
        this.dom.controls.xAxis.innerHTML = '<option value="">Select field...</option>';
        this.dom.controls.yAxis.innerHTML = '<option value="">Select field...</option>';
        
        if (!this.state.objectType || !this.state.objectType.fields) return;
        
        // Get fields array sorted by order
        const fieldsArray = Object.entries(this.state.objectType.fields).map(([id, field]) => ({
            id,
            ...field
        }));
        fieldsArray.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // X-Axis: Categorical fields (date, text, dropdown, relationship)
        const xFields = fieldsArray.filter(f => 
            f.type === 'date' || 
            f.type === 'text' || 
            f.type === 'dropdown' || 
            f.type === 'relationship'
        );
        
        xFields.forEach(field => {
            const option = document.createElement('option');
            option.value = field.id;
            option.textContent = `${field.name} (${field.type})`;
            this.dom.controls.xAxis.appendChild(option);
        });
        
        // Y-Axis: Numeric fields (number, boolean)
        const yFields = fieldsArray.filter(f => 
            f.type === 'number' || 
            f.type === 'boolean'
        );
        
        yFields.forEach(field => {
            const option = document.createElement('option');
            option.value = field.id;
            option.textContent = `${field.name} (${field.type})`;
            this.dom.controls.yAxis.appendChild(option);
        });
        
        // Fallback: If no numeric fields, allow all fields on Y-axis
        if (yFields.length === 0) {
            fieldsArray.forEach(field => {
                const option = document.createElement('option');
                option.value = field.id;
                option.textContent = `${field.name} (${field.type})`;
                this.dom.controls.yAxis.appendChild(option);
            });
        }
        
        // Auto-select first available fields
        if (xFields.length > 0) {
            this.dom.controls.xAxis.value = xFields[0].id;
            this.state.currentConfig.xFieldId = xFields[0].id;
        }
        
        if (yFields.length > 0) {
            this.dom.controls.yAxis.value = yFields[0].id;
            this.state.currentConfig.yFieldId = yFields[0].id;
        }
    }
    
    // ============================================
    // PRIVATE METHODS - CHART UPDATE (THE CORE!)
    // ============================================
    
    async _updateChart() {
        const { chartType, xFieldId, yFieldId, aggregation } = this.state.currentConfig;
        
        // Validate selections
        if (!xFieldId || !yFieldId) {
            this._showEmptyState('Select X and Y axis fields to generate chart');
            return;
        }
        
        // Get field metadata
        const xField = this.state.objectType.fields[xFieldId];
        const yField = this.state.objectType.fields[yFieldId];
        
        if (!xField || !yField) {
            this._showEmptyState('Invalid field selection');
            return;
        }
        
        // Show loading state
        this._showLoadingState();
        
        try {
            // Prepare data (async for relationship resolution)
            const dataPoints = await this._prepareData(xFieldId, yFieldId, xField, yField, aggregation, chartType);
            
            if (dataPoints.length === 0) {
                this._showEmptyState('No data available for selected fields');
                return;
            }
            
            // Render chart
            this._renderChart(chartType, dataPoints, xField, yField);
            
            // Update statistics
            this._updateStats(dataPoints, yField);
            
        } catch (error) {
            console.error('Chart update error:', error);
            this._showEmptyState('Error generating chart: ' + error.message);
        }
    }
    
    _showEmptyState(message) {
        this.dom.canvas.parentElement.innerHTML = `
            <div class="chart-empty">${message}</div>
        `;
        this.dom.stats.innerHTML = '';
    }
    
    _showLoadingState() {
        this.dom.canvas.parentElement.innerHTML = `
            <canvas id="inlineChart"></canvas>
        `;
        this.dom.canvas = document.getElementById('inlineChart');
    }
    
    // ============================================
    // PRIVATE METHODS - DATA PREPARATION
    // ============================================
    
    async _prepareData(xFieldId, yFieldId, xField, yField, aggregation, chartType) {
        const dataPoints = [];
        
        // For relationship fields, load display names
        if (xField.type === 'relationship' && xField.targetType) {
            await this._loadRelationshipCache(xField.targetType);
        }
        
        // Process each instance
        this.state.instances.forEach(instance => {
            if (!instance.data) return;
            
            const xValue = instance.data[xFieldId];
            const yValue = instance.data[yFieldId];
            
            if (xValue !== undefined && xValue !== null && yValue !== undefined && yValue !== null) {
                let xLabel = xValue;
                
                // Format X value based on type
                if (xField.type === 'date') {
                    // Handle date timezone properly
                    if (xValue.includes('-')) {
                        const [year, month, day] = xValue.split('-');
                        xLabel = new Date(year, month - 1, day).toLocaleDateString();
                    } else {
                        xLabel = new Date(xValue).toLocaleDateString();
                    }
                } else if (xField.type === 'boolean') {
                    xLabel = xValue ? 'Yes' : 'No';
                } else if (xField.type === 'relationship') {
                    xLabel = this.state.cache.relationships[xValue] || xValue.substring(0, 8);
                }
                
                // Convert Y value to number
                let yNum = yValue;
                if (yField.type === 'number') {
                    yNum = parseFloat(yValue);
                } else if (yField.type === 'boolean') {
                    yNum = yValue ? 1 : 0;
                }
                
                dataPoints.push({
                    x: xValue,        // Raw value for sorting
                    xLabel: xLabel,   // Display value
                    y: yNum           // Numeric value
                });
            }
        });
        
        // Sort by X value for line charts with dates
        if (chartType === 'line' && xField.type === 'date') {
            dataPoints.sort((a, b) => new Date(a.x) - new Date(b.x));
        }
        
        // Apply aggregation if needed
        if (aggregation !== 'none' && chartType !== 'pie') {
            return this._aggregateData(dataPoints, aggregation);
        }
        
        return dataPoints;
    }
    
    async _loadRelationshipCache(targetTypeId) {
        try {
            const instancesSnap = await db.ref('objects')
                .orderByChild('typeId')
                .equalTo(targetTypeId)
                .once('value');
            
            instancesSnap.forEach(snap => {
                const instance = snap.val();
                let displayName = snap.key.substring(0, 8);
                
                if (instance.data) {
                    const firstValue = Object.values(instance.data).find(v => v && v !== '');
                    if (firstValue) {
                        displayName = String(firstValue).substring(0, 50);
                    }
                }
                
                this.state.cache.relationships[snap.key] = displayName;
            });
        } catch (error) {
            console.error('Failed to load relationship cache:', error);
        }
    }
    
    _aggregateData(dataPoints, aggregation) {
        // Group by X label
        const groups = {};
        dataPoints.forEach(point => {
            const key = point.xLabel;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(point.y);
        });
        
        // Apply aggregation function
        const aggregated = [];
        Object.entries(groups).forEach(([xLabel, yValues]) => {
            let value;
            
            switch (aggregation) {
                case 'sum':
                    value = yValues.reduce((a, b) => a + b, 0);
                    break;
                case 'avg':
                    value = yValues.reduce((a, b) => a + b, 0) / yValues.length;
                    break;
                case 'count':
                    value = yValues.length;
                    break;
                case 'min':
                    value = Math.min(...yValues);
                    break;
                case 'max':
                    value = Math.max(...yValues);
                    break;
                default:
                    value = yValues[0];
            }
            
            aggregated.push({
                xLabel: xLabel,
                y: value
            });
        });
        
        return aggregated;
    }
    
    // ============================================
    // PRIVATE METHODS - CHART RENDERING
    // ============================================
    
    _cleanupChart() {
        if (this.state.chart) {
            this.state.chart.destroy();
            this.state.chart = null;
        }
    }
    
    _renderChart(chartType, dataPoints, xField, yField) {
        // Cleanup existing chart
        this._cleanupChart();
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            this._showEmptyState('Chart.js library not loaded');
            return;
        }
        
        const ctx = this.dom.canvas.getContext('2d');
        let chartConfig;
        
        if (chartType === 'pie') {
            // Pie chart: count occurrences of each category
            const valueCounts = {};
            dataPoints.forEach(point => {
                const key = point.xLabel;
                valueCounts[key] = (valueCounts[key] || 0) + 1;
            });
            
            chartConfig = {
                type: 'pie',
                data: {
                    labels: Object.keys(valueCounts),
                    datasets: [{
                        data: Object.values(valueCounts),
                        backgroundColor: [
                            '#83CAFF', '#71A7CF', '#6289A7', '#EBB820',
                            '#D8ECFB', '#214159', '#F1F8FE', '#E7F5FF'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            };
        } else if (chartType === 'scatter') {
            chartConfig = {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: `${xField.name} vs ${yField.name}`,
                        data: dataPoints.map((p, index) => ({
                            x: index,
                            y: p.y
                        })),
                        backgroundColor: '#83CAFF',
                        borderColor: '#83CAFF',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const point = dataPoints[context.dataIndex];
                                    return `${point.xLabel}: ${point.y}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            title: {
                                display: true,
                                text: xField.name
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: yField.name
                            }
                        }
                    }
                }
            };
        } else {
            // Line and Bar charts
            chartConfig = {
                type: chartType,
                data: {
                    labels: dataPoints.map(p => p.xLabel),
                    datasets: [{
                        label: yField.name,
                        data: dataPoints.map(p => p.y),
                        backgroundColor: chartType === 'bar' ? '#83CAFF' : 'rgba(131, 202, 255, 0.1)',
                        borderColor: '#83CAFF',
                        borderWidth: 2,
                        fill: chartType === 'line',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            };
        }
        
        try {
            this.state.chart = new Chart(ctx, chartConfig);
            console.log('Chart rendered successfully with', dataPoints.length, 'data points');
        } catch (error) {
            console.error('Chart rendering error:', error);
            this._showEmptyState('Error rendering chart');
        }
    }
    
    // ============================================
    // PRIVATE METHODS - STATISTICS
    // ============================================
    
    _updateStats(dataPoints, yField) {
        this.dom.stats.innerHTML = '';
        
        if (dataPoints.length === 0) {
            this.dom.stats.innerHTML = '<div class="chart-empty">No statistics available</div>';
            return;
        }
        
        // Extract Y values
        const yValues = dataPoints.map(p => p.y).filter(v => typeof v === 'number' && !isNaN(v));
        
        if (yValues.length === 0) {
            this.dom.stats.innerHTML = '<div class="chart-empty">No numeric data available</div>';
            return;
        }
        
        // Calculate statistics
        const stats = {
            'Count': yValues.length,
            'Sum': yValues.reduce((a, b) => a + b, 0).toFixed(2),
            'Average': (yValues.reduce((a, b) => a + b, 0) / yValues.length).toFixed(2),
            'Min': Math.min(...yValues).toFixed(2),
            'Max': Math.max(...yValues).toFixed(2)
        };
        
        // Render stat items
        Object.entries(stats).forEach(([label, value]) => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            statItem.innerHTML = `
                <div class="stat-label">${label}</div>
                <div class="stat-value">${value}</div>
            `;
            this.dom.stats.appendChild(statItem);
        });
    }
}

// ============================================
// GORDATA MANAGER CLASS
// Customizable dashboard/workspace manager
// ============================================

class GordataManager {
    constructor() {
        // Default configuration
        this.config = {
            columns: 3,
            rows: [
                { height: 200 },
                { height: 250 },
                { height: 200 }
            ],
            sockets: {}
        };
        
        this.editMode = false;
        this.selectedSockets = new Set();
        this.initialized = false;
        
        this._initDOM();
        this._loadConfig();
    }
    
    _initDOM() {
        this.gordataGrid = document.getElementById('gordataGrid');
        this.gordataControls = document.getElementById('gordataControls');
        this.rowControls = document.getElementById('rowControls');
        this.addRowBtn = document.getElementById('addRowBtn');
        this.toggleEditModeBtn = document.getElementById('toggleEditModeBtn');
        this.saveGordataBtn = document.getElementById('saveGordataBtn');
        this.resetGordataBtn = document.getElementById('resetGordataBtn');
        this.editGordataBtn = document.getElementById('editGordataBtn');
        this.backFromGordataBtn = document.getElementById('backFromGordataBtn');
        
        // Widget picker elements
        this.widgetPickerModal = document.getElementById('widgetPickerModal');
        this.widgetTabs = document.querySelectorAll('.widget-tab');
        this.entitiesTab = document.getElementById('entitiesTab');
        this.specialTab = document.getElementById('specialTab');
        this.widgetObjectTypesList = document.getElementById('widgetObjectTypesList');
        this.widgetDocumentsList = document.getElementById('widgetDocumentsList');
        this.widgetRoomsList = document.getElementById('widgetRoomsList');
        this.cancelWidgetPickerBtn = document.getElementById('cancelWidgetPickerBtn');
        
        this.currentSocketPosition = null; // Track which socket is being configured
    }
    
    _loadConfig() {
        const saved = localStorage.getItem('gordataConfig');
        if (saved) {
            try {
                this.config = JSON.parse(saved);
                // Always lock to 3 columns
                this.config.columns = 3;
            } catch (e) {
                console.error('Failed to load Gordata config:', e);
            }
        }
    }
    
    saveConfig() {
        localStorage.setItem('gordataConfig', JSON.stringify(this.config));
        console.log('Gordata config saved:', this.config);
    }
    
    initialize() {
        if (!this.initialized) {
            this._bindEvents();
            this.initialized = true;
        }
        this.renderGrid();
        this.renderRowControls();
    }
    
    _bindEvents() {
        // Add row button
        this.addRowBtn.addEventListener('click', () => this.addRow());
        
        // Edit mode toggle
        this.toggleEditModeBtn.addEventListener('click', () => this.toggleEditMode());
        this.editGordataBtn.addEventListener('click', () => this.toggleEditMode());
        
        // Save button
        this.saveGordataBtn.addEventListener('click', () => {
            this.saveConfig();
            this.toggleEditMode();
        });
        
        // Reset button
        this.resetGordataBtn.addEventListener('click', () => {
            if (confirm('Reset grid to default layout? This will remove all widgets and reset rows/columns.')) {
                this.resetGrid();
            }
        });
        
        // Widget picker tab switching
        this.widgetTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.widgetTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const tabName = tab.dataset.tab;
                if (tabName === 'entities') {
                    this.entitiesTab.classList.remove('hidden');
                    this.specialTab.classList.add('hidden');
                } else {
                    this.entitiesTab.classList.add('hidden');
                    this.specialTab.classList.remove('hidden');
                }
            });
        });
        
        // Cancel widget picker
        this.cancelWidgetPickerBtn.addEventListener('click', () => {
            this.closeWidgetPicker();
        });
        
        // Special widget item clicks
        this.specialTab.addEventListener('click', (e) => {
            const item = e.target.closest('.widget-special-item');
            if (!item) return;
            
            const widgetType = item.dataset.widget;
            
            if (widgetType === 'instanceChart') {
                this.addWidget({
                    type: 'instanceChart',
                    title: 'Instance Count Chart'
                });
            }
            // Other special widgets will be added here later
        });
    }
    
    addRow(height = 200) {
        this.config.rows.push({ height });
        this.renderRowControls();
        this.renderGrid();
    }
    
    removeRow(index) {
        if (this.config.rows.length <= 1) return; // Keep at least 1 row
        this.config.rows.splice(index, 1);
        this.renderRowControls();
        this.renderGrid();
    }
    
    updateRowHeight(index, height) {
        this.config.rows[index].height = height;
        this.renderGrid();
    }
    
    renderRowControls() {
        this.rowControls.innerHTML = '';
        
        this.config.rows.forEach((row, index) => {
            const control = document.createElement('div');
            control.className = 'row-control';
            
            control.innerHTML = `
                <label>Row ${index + 1}</label>
                <input type="range" min="100" max="500" value="${row.height}" 
                    data-row="${index}" class="row-height-slider">
                <span class="height-value">${row.height}px</span>
                ${this.config.rows.length > 1 ? 
                    `<button class="remove-row" data-row="${index}">x</button>` : 
                    ''}
            `;
            
            const slider = control.querySelector('.row-height-slider');
            const valueDisplay = control.querySelector('.height-value');
            
            slider.addEventListener('input', (e) => {
                const newHeight = parseInt(e.target.value);
                valueDisplay.textContent = `${newHeight}px`;
                this.updateRowHeight(index, newHeight);
            });
            
            const removeBtn = control.querySelector('.remove-row');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => this.removeRow(index));
            }
            
            this.rowControls.appendChild(control);
        });
    }
    
    renderGrid() {
        // Set up CSS Grid
        const rowTemplate = this.config.rows.map(r => `${r.height}px`).join(' ');
        const colTemplate = `repeat(${this.config.columns}, 1fr)`;
        
        this.gordataGrid.style.gridTemplateRows = rowTemplate;
        this.gordataGrid.style.gridTemplateColumns = colTemplate;
        
        // Generate sockets
        this.gordataGrid.innerHTML = '';
        
        for (let row = 0; row < this.config.rows.length; row++) {
            for (let col = 0; col < this.config.columns; col++) {
                const socket = this.createSocket(row, col);
                this.gordataGrid.appendChild(socket);
            }
        }
    }
    
    createSocket(row, col) {
        const socket = document.createElement('div');
        socket.className = 'grid-socket';
        socket.dataset.row = row;
        socket.dataset.col = col;
        
        if (this.editMode) {
            socket.classList.add('edit-mode');
        }
        
        // Check if socket has a widget
        const socketKey = `${row}-${col}`;
        const widgetData = this.config.sockets[socketKey];
        
        if (widgetData) {
            socket.classList.add('has-widget');
            socket.innerHTML = this.renderWidget(widgetData, socketKey);
        } else {
            socket.innerHTML = `
                <div class="socket-coordinates">R${row + 1}C${col + 1}</div>
                <div class="socket-placeholder">
                    <div class="socket-placeholder-icon">+</div>
                    <div class="socket-placeholder-text">Add Widget</div>
                </div>
            `;
            
            socket.addEventListener('click', () => {
                this.handleSocketClick(socket, row, col);
            });
        }
        
        return socket;
    }
    
    handleSocketClick(socket, row, col) {
        const socketKey = `${row}-${col}`;
        
        if (this.editMode) {
            // In edit mode: toggle selection for combining sockets
            if (socket.classList.contains('selected')) {
                socket.classList.remove('selected');
                this.selectedSockets.delete(socketKey);
            } else {
                socket.classList.add('selected');
                this.selectedSockets.add(socketKey);
            }
            console.log('Selected sockets:', Array.from(this.selectedSockets));
        } else {
            // Not in edit mode: open widget picker
            this.openWidgetPicker(row, col);
        }
    }
    
    toggleEditMode() {
        this.editMode = !this.editMode;
        
        if (this.editMode) {
            this.gordataControls.classList.add('active');
            this.toggleEditModeBtn.textContent = 'Exit Edit Mode';
            this.editGordataBtn.textContent = 'Exit Edit Mode';
        } else {
            this.gordataControls.classList.remove('active');
            this.toggleEditModeBtn.textContent = 'Edit Layout';
            this.editGordataBtn.textContent = 'Edit Layout';
            this.selectedSockets.clear();
        }
        
        this.renderGrid();
    }
    
    resetGrid() {
        // Reset to default configuration
        this.config = {
            columns: 3,
            rows: [
                { height: 200 },
                { height: 250 },
                { height: 200 }
            ],
            sockets: {}
        };
        
        // Exit edit mode if in it
        if (this.editMode) {
            this.editMode = false;
            this.gordataControls.classList.remove('active');
            this.toggleEditModeBtn.textContent = 'Edit Layout';
            this.editGordataBtn.textContent = 'Edit Layout';
            this.selectedSockets.clear();
        }
        
        // Save and render
        this.saveConfig();
        this.renderGrid();
        this.renderRowControls();
        
        soundManager.play('accepted');
    }
    
    // ============================================
    // WIDGET MANAGEMENT
    // ============================================
    
    openWidgetPicker(row, col) {
        this.currentSocketPosition = { row, col };
        this.populateWidgetPicker();
        this.widgetPickerModal.classList.remove('hidden');
        soundManager.play('click');
    }
    
    closeWidgetPicker() {
        this.widgetPickerModal.classList.add('hidden');
        this.currentSocketPosition = null;
    }
    
    async populateWidgetPicker() {
        // Get reference to app instance
        if (!window.app) return;
        
        const app = window.app;
        const userId = app.currentUser ? app.currentUser.id : null;
        if (!userId) return;
        
        // Populate object types
        this.widgetObjectTypesList.innerHTML = '<div style="padding: 12px; color: #94a3b8; text-align: center;">Loading...</div>';
        
        try {
            const typesSnap = await db.ref('objectTypes')
                .orderByChild('authorId')
                .equalTo(userId)
                .once('value');
            
            this.widgetObjectTypesList.innerHTML = '';
            
            if (typesSnap.exists()) {
                typesSnap.forEach((childSnap) => {
                    const typeId = childSnap.key;
                    const type = childSnap.val();
                    
                    const item = document.createElement('div');
                    item.className = 'widget-item';
                    item.innerHTML = `
                        <div class="widget-item-icon">[Type]</div>
                        <div class="widget-item-info">
                            <div class="widget-item-title">${type.name}</div>
                            <div class="widget-item-desc">Object Type</div>
                        </div>
                    `;
                    item.onclick = () => this.addWidget({
                        type: 'objectType',
                        id: typeId,
                        title: type.name
                    });
                    this.widgetObjectTypesList.appendChild(item);
                });
            } else {
                this.widgetObjectTypesList.innerHTML = '<div style="padding: 12px; color: #94a3b8; text-align: center;">No object types yet</div>';
            }
        } catch (error) {
            console.error('Error loading object types:', error);
            this.widgetObjectTypesList.innerHTML = '<div style="padding: 12px; color: #94a3b8; text-align: center;">Error loading</div>';
        }
        
        // Populate documents
        this.widgetDocumentsList.innerHTML = '<div style="padding: 12px; color: #94a3b8; text-align: center;">Loading...</div>';
        
        try {
            const docsSnap = await db.ref('documents')
                .orderByChild('authorId')
                .equalTo(userId)
                .once('value');
            
            this.widgetDocumentsList.innerHTML = '';
            
            if (docsSnap.exists()) {
                docsSnap.forEach((childSnap) => {
                    const docId = childSnap.key;
                    const doc = childSnap.val();
                    
                    const item = document.createElement('div');
                    item.className = 'widget-item';
                    item.innerHTML = `
                        <div class="widget-item-icon">[Doc]</div>
                        <div class="widget-item-info">
                            <div class="widget-item-title">${doc.title || 'Untitled'}</div>
                            <div class="widget-item-desc">Document</div>
                        </div>
                    `;
                    item.onclick = () => this.addWidget({
                        type: 'document',
                        id: docId,
                        title: doc.title || 'Untitled'
                    });
                    this.widgetDocumentsList.appendChild(item);
                });
            } else {
                this.widgetDocumentsList.innerHTML = '<div style="padding: 12px; color: #94a3b8; text-align: center;">No documents yet</div>';
            }
        } catch (error) {
            console.error('Error loading documents:', error);
            this.widgetDocumentsList.innerHTML = '<div style="padding: 12px; color: #94a3b8; text-align: center;">Error loading</div>';
        }
        
        // Populate rooms
        this.widgetRoomsList.innerHTML = '<div style="padding: 12px; color: #94a3b8; text-align: center;">Loading...</div>';
        
        try {
            const roomsSnap = await db.ref('rooms').once('value');
            
            this.widgetRoomsList.innerHTML = '';
            
            if (roomsSnap.exists()) {
                roomsSnap.forEach((childSnap) => {
                    const roomId = childSnap.key;
                    const room = childSnap.val();
                    const playerCount = room.players ? Object.keys(room.players).length : 0;
                    
                    const item = document.createElement('div');
                    item.className = 'widget-item';
                    item.innerHTML = `
                        <div class="widget-item-icon">[Room]</div>
                        <div class="widget-item-info">
                            <div class="widget-item-title">${room.name || roomId}</div>
                            <div class="widget-item-desc">${playerCount} player${playerCount !== 1 ? 's' : ''}</div>
                        </div>
                    `;
                    item.onclick = () => this.addWidget({
                        type: 'room',
                        id: roomId,
                        title: room.name || roomId
                    });
                    this.widgetRoomsList.appendChild(item);
                });
            } else {
                this.widgetRoomsList.innerHTML = '<div style="padding: 12px; color: #94a3b8; text-align: center;">No rooms yet</div>';
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
            this.widgetRoomsList.innerHTML = '<div style="padding: 12px; color: #94a3b8; text-align: center;">Error loading</div>';
        }
    }
    
    addWidget(widgetData) {
        if (!this.currentSocketPosition) return;
        
        const { row, col } = this.currentSocketPosition;
        const socketKey = `${row}-${col}`;
        
        this.config.sockets[socketKey] = widgetData;
        this.closeWidgetPicker();
        this.renderGrid();
        this.saveConfig();
        
        soundManager.play('accepted');
    }
    
    removeWidget(socketKey) {
        delete this.config.sockets[socketKey];
        this.renderGrid();
        this.saveConfig();
        
        soundManager.play('reclick');
    }
    
    renderWidget(widgetData, socketKey) {
        const app = window.app;
        if (!app) return 'Widget loading...';
        
        switch (widgetData.type) {
            case 'objectType':
                return this.renderObjectTypeWidget(widgetData, socketKey);
            case 'document':
                return this.renderDocumentWidget(widgetData, socketKey);
            case 'room':
                return this.renderRoomWidget(widgetData, socketKey);
            case 'instanceChart':
                return this.renderInstanceChartWidget(widgetData, socketKey);
            default:
                return `
                    <div class="socket-widget">
                        <div class="socket-widget-header">
                            <span class="socket-widget-title">${widgetData.title || 'Widget'}</span>
                            <button class="socket-action-btn" onclick="window.app.gordataManager.removeWidget('${socketKey}')">Remove</button>
                        </div>
                        <div class="socket-widget-content">
                            Unknown widget type
                        </div>
                    </div>
                `;
        }
    }
    
    renderObjectTypeWidget(widgetData, socketKey) {
        const widgetId = `widget-${socketKey}`;
        
        // Render widget structure with placeholder
        const html = `
            <div class="socket-widget" id="${widgetId}">
                <div class="socket-widget-header">
                    <span class="socket-widget-title">${widgetData.title}</span>
                    <div class="socket-widget-actions">
                        <button class="socket-action-btn" onclick="window.app.openObjectType('${widgetData.id}')" title="View all">View</button>
                        <button class="socket-action-btn" onclick="window.app.gordataManager.removeWidget('${socketKey}')">Remove</button>
                    </div>
                </div>
                <div class="socket-widget-content">
                    <div class="widget-stat">
                        <span class="widget-stat-value" id="${widgetId}-count">...</span>
                        <span class="widget-stat-label">instances</span>
                    </div>
                    <div style="margin-top: 12px;">
                        <button class="btn-create" style="width: 100%; font-size: 12px; padding: 8px;" 
                            onclick="window.app.openObjectType('${widgetData.id}')">
                            View Instances
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Fetch live instance count
        this.updateObjectTypeCount(widgetData.id, widgetId);
        
        return html;
    }
    
    async updateObjectTypeCount(typeId, widgetId) {
        try {
            const userId = window.app.currentUser ? window.app.currentUser.id : null;
            if (!userId) return;
            
            const snapshot = await db.ref('objects')
                .orderByChild('typeId')
                .equalTo(typeId)
                .once('value');
            
            let count = 0;
            snapshot.forEach((childSnap) => {
                const obj = childSnap.val();
                if (obj.authorId === userId) {
                    count++;
                }
            });
            
            const countElement = document.getElementById(`${widgetId}-count`);
            if (countElement) {
                countElement.textContent = count;
            }
        } catch (error) {
            console.error('Error fetching instance count:', error);
            const countElement = document.getElementById(`${widgetId}-count`);
            if (countElement) {
                countElement.textContent = '?';
            }
        }
    }
    
    renderDocumentWidget(widgetData, socketKey) {
        const widgetId = `widget-${socketKey}`;
        
        // Render widget structure with placeholder
        const html = `
            <div class="socket-widget" id="${widgetId}">
                <div class="socket-widget-header">
                    <span class="socket-widget-title">${widgetData.title || 'Untitled'}</span>
                    <div class="socket-widget-actions">
                        <button class="socket-action-btn" onclick="window.app.gordataManager.removeWidget('${socketKey}')">Remove</button>
                    </div>
                </div>
                <div class="socket-widget-content">
                    <div class="widget-preview" id="${widgetId}-preview" style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 12px; min-height: 40px;">
                        Loading preview...
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-secondary" style="flex: 1; font-size: 12px; padding: 8px;" 
                            onclick="window.app.openDocument('${widgetData.id}', true)">
                            Read
                        </button>
                        <button class="btn-create" style="flex: 1; font-size: 12px; padding: 8px;" 
                            onclick="window.app.openDocument('${widgetData.id}', false)">
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Fetch document preview
        this.updateDocumentPreview(widgetData.id, widgetId);
        
        return html;
    }
    
    async updateDocumentPreview(docId, widgetId) {
        try {
            const snapshot = await db.ref(`documents/${docId}`).once('value');
            
            if (!snapshot.exists()) {
                const previewElement = document.getElementById(`${widgetId}-preview`);
                if (previewElement) {
                    previewElement.textContent = 'Document not found';
                    previewElement.style.fontStyle = 'italic';
                }
                return;
            }
            
            const doc = snapshot.val();
            const content = doc.content || '';
            const preview = content.length > 100 ? content.substring(0, 100) + '...' : content || 'No content yet';
            
            const previewElement = document.getElementById(`${widgetId}-preview`);
            if (previewElement) {
                previewElement.textContent = preview;
            }
        } catch (error) {
            console.error('Error fetching document preview:', error);
            const previewElement = document.getElementById(`${widgetId}-preview`);
            if (previewElement) {
                previewElement.textContent = 'Error loading preview';
                previewElement.style.fontStyle = 'italic';
            }
        }
    }
    
    renderRoomWidget(widgetData, socketKey) {
        const widgetId = `widget-${socketKey}`;
        
        // Render widget structure with placeholder
        const html = `
            <div class="socket-widget" id="${widgetId}">
                <div class="socket-widget-header">
                    <span class="socket-widget-title">${widgetData.title || widgetData.id}</span>
                    <div class="socket-widget-actions">
                        <button class="socket-action-btn" onclick="window.app.gordataManager.removeWidget('${socketKey}')">Remove</button>
                    </div>
                </div>
                <div class="socket-widget-content">
                    <div class="widget-stat">
                        <span class="widget-stat-value" id="${widgetId}-count">...</span>
                        <span class="widget-stat-label">players</span>
                    </div>
                    <div id="${widgetId}-players" style="font-size: 11px; color: #64748b; margin: 8px 0; min-height: 20px;">
                        Loading...
                    </div>
                    <button class="btn-create" style="width: 100%; font-size: 12px; padding: 8px;" 
                        onclick="window.app.joinRoom('${widgetData.id}')">
                        Join Room
                    </button>
                </div>
            </div>
        `;
        
        // Fetch live room data
        this.updateRoomData(widgetData.id, widgetId);
        
        return html;
    }
    
    async updateRoomData(roomId, widgetId) {
        try {
            const snapshot = await db.ref(`rooms/${roomId}`).once('value');
            
            if (!snapshot.exists()) {
                const countElement = document.getElementById(`${widgetId}-count`);
                const playersElement = document.getElementById(`${widgetId}-players`);
                if (countElement) countElement.textContent = '0';
                if (playersElement) {
                    playersElement.textContent = 'Room not found';
                    playersElement.style.fontStyle = 'italic';
                }
                return;
            }
            
            const room = snapshot.val();
            const players = room.players || {};
            const playerCount = Object.keys(players).length;
            const playerNames = Object.values(players).map(p => p.name || 'Unknown').join(', ');
            
            const countElement = document.getElementById(`${widgetId}-count`);
            const playersElement = document.getElementById(`${widgetId}-players`);
            
            if (countElement) {
                countElement.textContent = playerCount;
            }
            
            if (playersElement) {
                if (playerCount === 0) {
                    playersElement.textContent = 'No players yet';
                    playersElement.style.fontStyle = 'italic';
                } else {
                    playersElement.textContent = playerNames;
                    playersElement.style.fontStyle = 'normal';
                }
            }
        } catch (error) {
            console.error('Error fetching room data:', error);
            const countElement = document.getElementById(`${widgetId}-count`);
            const playersElement = document.getElementById(`${widgetId}-players`);
            if (countElement) countElement.textContent = '?';
            if (playersElement) {
                playersElement.textContent = 'Error loading data';
                playersElement.style.fontStyle = 'italic';
            }
        }
    }
    
    renderInstanceChartWidget(widgetData, socketKey) {
        const widgetId = `widget-${socketKey}`;
        const chartId = `chart-${socketKey}`;
        
        // Render widget structure with canvas for chart
        const html = `
            <div class="socket-widget" id="${widgetId}">
                <div class="socket-widget-header">
                    <span class="socket-widget-title">${widgetData.title || 'Instance Count Chart'}</span>
                    <div class="socket-widget-actions">
                        <button class="socket-action-btn" onclick="window.app.gordataManager.removeWidget('${socketKey}')">Remove</button>
                    </div>
                </div>
                <div class="socket-widget-content" style="padding: 8px;">
                    <canvas id="${chartId}" style="max-height: 100%;"></canvas>
                </div>
            </div>
        `;
        
        // Fetch data and render chart
        this.updateInstanceChart(chartId, widgetId);
        
        return html;
    }
    
    async updateInstanceChart(chartId, widgetId) {
        try {
            const userId = window.app.currentUser ? window.app.currentUser.id : null;
            if (!userId) return;
            
            // Fetch all object types for this user
            const typesSnapshot = await db.ref('objectTypes')
                .orderByChild('authorId')
                .equalTo(userId)
                .once('value');
            
            if (!typesSnapshot.exists()) {
                // No object types yet - show empty state
                const canvas = document.getElementById(chartId);
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.font = '14px sans-serif';
                    ctx.fillStyle = '#64748b';
                    ctx.textAlign = 'center';
                    ctx.fillText('No object types yet', canvas.width / 2, canvas.height / 2);
                }
                return;
            }
            
            // Collect types and count instances for each
            const typesData = [];
            
            for (const [typeId, type] of Object.entries(typesSnapshot.val())) {
                // Count instances for this type
                const instancesSnapshot = await db.ref('objects')
                    .orderByChild('typeId')
                    .equalTo(typeId)
                    .once('value');
                
                let count = 0;
                if (instancesSnapshot.exists()) {
                    instancesSnapshot.forEach((childSnap) => {
                        const obj = childSnap.val();
                        if (obj.authorId === userId) {
                            count++;
                        }
                    });
                }
                
                typesData.push({
                    name: type.name || 'Untitled',
                    count: count
                });
            }
            
            // Sort by count descending
            typesData.sort((a, b) => b.count - a.count);
            
            // Prepare chart data
            const labels = typesData.map(t => t.name);
            const data = typesData.map(t => t.count);
            
            // Render chart
            const canvas = document.getElementById(chartId);
            if (!canvas) return;
            
            // Destroy existing chart if any
            if (canvas.chart) {
                canvas.chart.destroy();
            }
            
            // Create horizontal bar chart
            canvas.chart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Instances',
                        data: data,
                        backgroundColor: [
                            '#3b82f6',
                            '#8b5cf6',
                            '#ec4899',
                            '#f59e0b',
                            '#10b981',
                            '#06b6d4',
                            '#6366f1',
                            '#f43f5e'
                        ],
                        borderWidth: 0,
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.parsed.x + ' instance' + (context.parsed.x !== 1 ? 's' : '');
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            },
                            grid: {
                                color: '#f1f5f9'
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
            
        } catch (error) {
            console.error('Error creating instance chart:', error);
            const canvas = document.getElementById(chartId);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.font = '14px sans-serif';
                ctx.fillStyle = '#dc2626';
                ctx.textAlign = 'center';
                ctx.fillText('Error loading chart', canvas.width / 2, canvas.height / 2);
            }
        }
    }
}


// ============================================
// APP CLASS
// ============================================

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

        // DOM elements - Gordata View
        this.gordataView = document.getElementById("gordataView");
        this.backFromGordataBtn = document.getElementById("backFromGordataBtn");

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

        // DOM elements - Object Instances View
        this.objectInstancesView = document.getElementById("objectInstancesView");
        this.instancesTypeName = document.getElementById("instancesTypeName");
        this.instancesList = document.getElementById("instancesList");
        this.instancesTableWrapper = document.getElementById("instancesTableWrapper");
        this.instancesTable = document.getElementById("instancesTable");
        this.instancesTableHead = document.getElementById("instancesTableHead");
        this.instancesTableBody = document.getElementById("instancesTableBody");
        this.instancesSearchInput = document.getElementById("instancesSearchInput");
        this.cardViewBtn = document.getElementById("cardViewBtn");
        this.tableViewBtn = document.getElementById("tableViewBtn");
        this.exportCsvBtn = document.getElementById("exportCsvBtn");
        this.bulkDeleteBtn = document.getElementById("bulkDeleteBtn");
        this.createInstanceBtn = document.getElementById("createInstanceBtn");
        this.visualizeBtn = document.getElementById("visualizeBtn");
        this.backFromInstancesBtn = document.getElementById("backFromInstancesBtn");

        // DOM elements - Data Visualization View
        this.dataVisualizationView = document.getElementById("dataVisualizationView");
        this.visualizationTypeName = document.getElementById("visualizationTypeName");
        this.chartTypeSelect = document.getElementById("chartTypeSelect");
        this.xAxisSelect = document.getElementById("xAxisSelect");
        this.yAxisSelect = document.getElementById("yAxisSelect");
        this.aggregationSelect = document.getElementById("aggregationSelect");
        this.xAxisGroup = document.getElementById("xAxisGroup");
        this.yAxisGroup = document.getElementById("yAxisGroup");
        this.aggregationGroup = document.getElementById("aggregationGroup");
        this.dataChart = document.getElementById("dataChart");
        this.chartStats = document.getElementById("chartStats");
        this.backFromVisualizationBtn = document.getElementById("backFromVisualizationBtn");

        // DOM elements - Object Instance Editor View
        this.objectInstanceEditorView = document.getElementById("objectInstanceEditorView");
        this.instanceEditorContext = document.getElementById("instanceEditorContext");
        this.instanceEditorTitle = document.getElementById("instanceEditorTitle");
        this.instanceForm = document.getElementById("instanceForm");
        this.saveInstanceBtn = document.getElementById("saveInstanceBtn");
        this.deleteInstanceBtn = document.getElementById("deleteInstanceBtn");
        this.backFromInstanceEditorBtn = document.getElementById("backFromInstanceEditorBtn");

        // DOM elements - Editor View
        this.editorView = document.getElementById("editorView");
        this.editorHeaderTitle = document.getElementById("editorHeaderTitle");
        this.editMode = document.getElementById("editMode");
        this.readerMode = document.getElementById("readerMode");
        this.modeToggleBtn = document.getElementById("modeToggleBtn");
        this.docTitle = document.getElementById("docTitle");
        this.docPrivacy = document.getElementById("docPrivacy");
        this.docContent = document.getElementById("docContent");
        this.readerTitle = document.getElementById("readerTitle");
        this.readerContent = document.getElementById("readerContent");
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
        this.diceHistory = document.getElementById("diceHistory");
        this.rollD4Btn = document.getElementById("rollD4Btn");
        this.rollD6Btn = document.getElementById("rollD6Btn");
        this.rollD8Btn = document.getElementById("rollD8Btn");
        this.rollD10Btn = document.getElementById("rollD10Btn");
        this.rollD12Btn = document.getElementById("rollD12Btn");
        this.rollD20Btn = document.getElementById("rollD20Btn");
        this.rollD100Btn = document.getElementById("rollD100Btn");
        this.leaveDiceBtn = document.getElementById("leaveDiceBtn");
        
        // Dice tabs
        this.diceRollTab = document.getElementById("diceRollTab");
        this.diceHistoryTab = document.getElementById("diceHistoryTab");
        this.diceActionsTab = document.getElementById("diceActionsTab");
        this.diceRollContent = document.getElementById("diceRollContent");
        this.diceHistoryContent = document.getElementById("diceHistoryContent");
        this.diceActionsContent = document.getElementById("diceActionsContent");
        
        // Dice actions
        this.createDiceActionBtn = document.getElementById("createDiceActionBtn");
        this.diceActionsList = document.getElementById("diceActionsList");
        this.diceActionBuilder = document.getElementById("diceActionBuilder");
        this.closeDiceActionBuilderBtn = document.getElementById("closeDiceActionBuilderBtn");
        this.actionBuilderTitle = document.getElementById("actionBuilderTitle");
        
        // Action builder steps
        this.actionProgressFill = document.getElementById("actionProgressFill");
        this.actionProgressText = document.getElementById("actionProgressText");
        this.actionStep1 = document.getElementById("actionStep1");
        this.actionStep2 = document.getElementById("actionStep2");
        this.actionStep3 = document.getElementById("actionStep3");
        
        // Action builder inputs - Step 1
        this.actionNameInput = document.getElementById("actionNameInput");
        this.actionTargetTypeSelect = document.getElementById("actionTargetTypeSelect");
        this.actionTargetInstanceSelect = document.getElementById("actionTargetInstanceSelect");
        this.actionStep1NextBtn = document.getElementById("actionStep1NextBtn");
        
        // Action builder inputs - Step 2
        this.conditionDetails = document.getElementById("conditionDetails");
        this.conditionOperatorSelect = document.getElementById("conditionOperatorSelect");
        this.conditionValueInput = document.getElementById("conditionValueInput");
        this.actionStep2BackBtn = document.getElementById("actionStep2BackBtn");
        this.actionStep2NextBtn = document.getElementById("actionStep2NextBtn");
        
        // Action builder inputs - Step 3
        this.actionFieldSelect = document.getElementById("actionFieldSelect");
        this.actionOperatorSelect = document.getElementById("actionOperatorSelect");
        this.actionFixedValueInput = document.getElementById("actionFixedValueInput");
        this.actionMinValueInput = document.getElementById("actionMinValueInput");
        this.actionMaxValueInput = document.getElementById("actionMaxValueInput");
        this.actionStep3BackBtn = document.getElementById("actionStep3BackBtn");
        this.actionStep3SaveBtn = document.getElementById("actionStep3SaveBtn");

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

        // Top-level navigation elements
        this.topNavigation = document.getElementById("topNavigation");
        this.navUserName = document.getElementById("navUserName");
        this.navPills = document.querySelectorAll(".nav-pill");

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
        this.diceActions = [];
        this.currentDiceActionId = null;
        this.currentActionStep = 1;
        this.diceActionsListener = null;
        this.diceInitialLoadComplete = false;
        this.storyListener = null;
        this.storyTurnListener = null;
        this.storyUsersListener = null;
        this.storyBlocksListener = null;
        this.currentObjectTypeId = null;
        this.currentInstanceId = null;
        this.currentObjectType = null;
        this.currentInstances = [];
        this.filteredInstances = [];
        this.selectedInstanceIds = new Set();
        this.currentView = 'card'; // 'card' or 'table'
        this.sortField = null;
        this.sortDirection = 'asc';
        this.navigationStack = []; // Track navigation history for relationships
        this.relationshipDisplayNames = {}; // Cache for relationship instance display names
        this.currentChart = null;
        this.objectTypesListener = null;
        this.instancesListener = null;
        this.fieldIdCounter = 0;
        this.roundStartTime = null;
        
        // Initialize Data Visualizer (clean module)
        this.dataVisualizer = new DataVisualizer();

        // Initialize Gordata Manager (customizable dashboard)
        this.gordataManager = new GordataManager();

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
        
        // Top-level navigation
        this.navPills.forEach(pill => {
            pill.onclick = () => {
                const navTarget = pill.dataset.nav;
                this.handleTopNavigation(navTarget);
            };
        });
        
        // Profile navigation
        this.backFromProfileBtn.onclick = () => this.closeProfile();
        
        // Gordata navigation
        this.backFromGordataBtn.onclick = () => this.closeGordata();
        
        // Object Type Builder actions
        this.createObjectTypeBtn.onclick = () => this.createObjectType();
        this.backFromBuilderBtn.onclick = () => this.closeObjectTypeBuilder();
        this.addFieldBtn.onclick = () => this.addField();
        this.saveObjectTypeBtn.onclick = () => this.saveObjectType();
        this.deleteObjectTypeBtn.onclick = () => this.deleteObjectType();
        
        // Object Instance actions
        this.backFromInstancesBtn.onclick = () => this.closeInstancesList();
        this.createInstanceBtn.onclick = () => this.createInstance();
        this.visualizeBtn.onclick = () => {
            // Check if we have data
            if (this.currentInstances.length === 0) {
                this.showToast("No data to visualize. Create some instances first!", "error");
                return;
            }
            
            // Pass data to visualizer and show it
            this.dataVisualizer.setData(this.currentInstances, this.currentObjectType);
            this.dataVisualizer.show();
        };
        this.cardViewBtn.onclick = () => this.switchInstanceView('card');
        this.tableViewBtn.onclick = () => this.switchInstanceView('table');
        this.exportCsvBtn.onclick = () => this.exportToCSV();
        this.bulkDeleteBtn.onclick = () => this.bulkDeleteInstances();
        this.instancesSearchInput.oninput = () => this.filterInstances();
        this.backFromInstanceEditorBtn.onclick = () => this.closeInstanceEditor();
        this.saveInstanceBtn.onclick = () => this.saveInstance();
        this.deleteInstanceBtn.onclick = () => this.deleteInstance();
        
        // Data Visualization actions
        this.backFromVisualizationBtn.onclick = () => this.closeVisualization();
        this.chartTypeSelect.onchange = () => this.updateChart();
        this.xAxisSelect.onchange = () => this.updateChart();
        this.yAxisSelect.onchange = () => this.updateChart();
        this.aggregationSelect.onchange = () => this.updateChart();
        
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
        
        // Dice tabs
        this.diceRollTab.onclick = () => this.switchDiceTab('roll');
        this.diceHistoryTab.onclick = () => this.switchDiceTab('history');
        this.diceActionsTab.onclick = () => this.switchDiceTab('actions');
        
        // Dice Actions
        this.createDiceActionBtn.onclick = () => this.openDiceActionBuilder();
        this.closeDiceActionBuilderBtn.onclick = () => this.closeDiceActionBuilder();
        
        // Action builder navigation
        this.actionStep1NextBtn.onclick = () => this.goToActionStep(2);
        this.actionStep2BackBtn.onclick = () => this.goToActionStep(1);
        this.actionStep2NextBtn.onclick = () => this.goToActionStep(3);
        this.actionStep3BackBtn.onclick = () => this.goToActionStep(2);
        this.actionStep3SaveBtn.onclick = () => this.saveDiceAction();
        
        // Action builder conditional visibility
        document.querySelectorAll('input[name="conditionType"]').forEach(radio => {
            radio.onchange = () => {
                this.conditionDetails.classList.toggle('hidden', radio.value === 'always');
            };
        });
        
        document.querySelectorAll('input[name="valueSource"]').forEach(radio => {
            radio.onchange = () => {
                this.actionFixedValueInput.classList.toggle('hidden', radio.value !== 'fixed');
            };
        });
        
        // Action target type change
        this.actionTargetTypeSelect.onchange = () => this.loadActionTargetInstances();
        
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
        this.objectInstancesView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
        this.gordataView.classList.add("hidden");
        
        // Hide top navigation (user not logged in)
        this.hideTopNavigation();
        
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
        this.objectInstancesView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
        this.gordataView.classList.add("hidden");
        
        // Update top navigation
        this.updateTopNavigation('home');
        
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

    // ============================================
    // TOP-LEVEL NAVIGATION
    // ============================================

    handleTopNavigation(navTarget) {
        soundManager.play('click');
        
        switch(navTarget) {
            case 'home':
                this.showHomeView();
                this.updateTopNavigation('home');
                break;
            case 'gordata':
                this.showGordataView();
                this.updateTopNavigation('gordata');
                break;
            case 'toolkit':
                this.showHomeView();
                this.switchTab('toolkit');
                this.updateTopNavigation('home');
                break;
            case 'activity':
                // Placeholder - will navigate to activity hub when implemented
                this.showToast("Activity hub coming soon!", "info");
                break;
            case 'profile':
                this.openProfile(this.currentUser.id);
                this.updateTopNavigation('profile');
                break;
        }
    }

    updateTopNavigation(activeNav) {
        // Update active state on nav pills
        this.navPills.forEach(pill => {
            if (pill.dataset.nav === activeNav) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });
        
        // Update user name
        if (this.currentUser) {
            this.navUserName.textContent = this.currentUser.name;
        }
        
        // Show navigation (it starts hidden for auth view)
        this.topNavigation.classList.remove('hidden');
    }

    hideTopNavigation() {
        this.topNavigation.classList.add('hidden');
        // Remove all active states
        this.navPills.forEach(pill => pill.classList.remove('active'));
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
        
        // Update header title
        if (this.editorHeaderTitle) {
            this.editorHeaderTitle.textContent = doc.title || "Untitled";
        }

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
        this.gordataView.classList.add("hidden");
        this.editorView.classList.remove("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        this.objectInstancesView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
        
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
            this.deleteDocBtn.classList.add("hidden");
            this.deleteDocBtnReader.classList.remove("hidden");
            this.saveDocBtn.classList.add("hidden");
            this.renderReaderMode();
        } else {
            this.editMode.classList.remove("hidden");
            this.readerMode.classList.add("hidden");
            this.modeToggleBtn.textContent = "Reader Mode";
            this.deleteDocBtn.classList.remove("hidden");
            this.deleteDocBtnReader.classList.add("hidden");
            this.saveDocBtn.classList.remove("hidden");
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

            // Update header title
            if (this.editorHeaderTitle) {
                this.editorHeaderTitle.textContent = title;
            }

            soundManager.play('accepted');
            this.showToast("Document saved!", "success");
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
            // Auto-save is silent - sound is enough feedback
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
        card.onclick = () => this.openInstancesList(typeId);

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

        // Add edit button
        const editBtn = document.createElement("button");
        editBtn.className = "btn-secondary";
        editBtn.textContent = "Edit Type";
        editBtn.style.marginTop = "12px";
        editBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent opening instances list
            this.openObjectType(typeId);
        };
        card.appendChild(editBtn);

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
                this.renderField(field.id, field.name, field.type, field.options || [], field.targetType || null);
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
        this.objectInstancesView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.gordataView.classList.add("hidden");
        this.objectTypeBuilderView.classList.remove("hidden");

        soundManager.play('bite');
    }

    closeObjectTypeBuilder() {
        this.objectTypeBuilderView.classList.add("hidden");
        this.objectInstancesView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
        this.homeView.classList.remove("hidden");
        this.switchTab('toolkit');
    }

    addField() {
        const fieldId = `field_${Date.now()}_${this.fieldIdCounter++}`;
        this.renderField(fieldId, "", "text");
    }

    renderField(fieldId, fieldName = "", fieldType = "text", fieldOptions = [], targetType = null) {
        const fieldDiv = document.createElement("div");
        fieldDiv.className = "field-item";
        fieldDiv.dataset.fieldId = fieldId;

        const dragHandle = document.createElement("div");
        dragHandle.className = "field-drag-handle";
        dragHandle.textContent = ":::";

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
            { value: "boolean", label: "Yes/No" },
            { value: "dropdown", label: "Dropdown" },
            { value: "multiselect", label: "Multi-Select" },
            { value: "relationship", label: "Relationship" },
            { value: "url", label: "URL" },
            { value: "image", label: "Image URL" },
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
            { value: "color", label: "Color" }
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

        // Options input for dropdown/multiselect
        const optionsInput = document.createElement("input");
        optionsInput.type = "text";
        optionsInput.className = "field-options-input";
        optionsInput.placeholder = "Options (comma-separated)";
        optionsInput.dataset.fieldId = fieldId;
        optionsInput.value = fieldOptions.length > 0 ? fieldOptions.join(', ') : '';
        optionsInput.style.display = (fieldType === 'dropdown' || fieldType === 'multiselect') ? 'block' : 'none';

        // Target type selector for relationships
        const targetTypeSelect = document.createElement("select");
        targetTypeSelect.className = "field-options-input field-target-type";
        targetTypeSelect.dataset.fieldId = fieldId;
        targetTypeSelect.style.display = fieldType === 'relationship' ? 'block' : 'none';
        
        // Populate with object types
        this.populateObjectTypeSelector(targetTypeSelect, targetType);

        // Show/hide options/target based on type
        typeSelect.onchange = () => {
            const selectedType = typeSelect.value;
            if (selectedType === 'dropdown' || selectedType === 'multiselect') {
                optionsInput.style.display = 'block';
                targetTypeSelect.style.display = 'none';
            } else if (selectedType === 'relationship') {
                optionsInput.style.display = 'none';
                targetTypeSelect.style.display = 'block';
                this.populateObjectTypeSelector(targetTypeSelect, null);
            } else {
                optionsInput.style.display = 'none';
                targetTypeSelect.style.display = 'none';
            }
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "field-delete-btn";
        deleteBtn.textContent = "x";
        deleteBtn.onclick = () => this.removeField(fieldId);

        fieldDiv.appendChild(dragHandle);
        fieldDiv.appendChild(nameInput);
        fieldDiv.appendChild(typeSelect);
        fieldDiv.appendChild(optionsInput);
        fieldDiv.appendChild(targetTypeSelect);
        fieldDiv.appendChild(deleteBtn);

        this.fieldsList.appendChild(fieldDiv);
    }

    async populateObjectTypeSelector(selectElement, selectedTypeId = null) {
        selectElement.innerHTML = "";
        
        // Add default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "-- Select Object Type --";
        selectElement.appendChild(defaultOption);
        
        try {
            // Get all object types for this user
            const typesSnap = await db.ref("objectTypes")
                .orderByChild("authorId")
                .equalTo(this.currentUser.id)
                .once("value");
            
            if (typesSnap.exists()) {
                typesSnap.forEach(typeSnap => {
                    const type = typeSnap.val();
                    const option = document.createElement("option");
                    option.value = typeSnap.key;
                    option.textContent = type.name;
                    if (typeSnap.key === selectedTypeId) {
                        option.selected = true;
                    }
                    selectElement.appendChild(option);
                });
            }
        } catch (err) {
            console.error("Failed to load object types:", err);
        }
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
            const optionsInput = fieldEl.querySelector('.field-options-input');
            const targetTypeSelect = fieldEl.querySelector('.field-target-type');
            
            const fieldName = nameInput.value.trim();
            if (fieldName) {
                const field = {
                    name: fieldName,
                    type: typeSelect.value,
                    order: index
                };
                
                // Add options for dropdown/multiselect
                if (typeSelect.value === 'dropdown' || typeSelect.value === 'multiselect') {
                    const optionsValue = optionsInput.value.trim();
                    field.options = optionsValue ? optionsValue.split(',').map(o => o.trim()).filter(o => o) : [];
                }
                
                // Add targetType for relationship
                if (typeSelect.value === 'relationship' && targetTypeSelect) {
                    field.targetType = targetTypeSelect.value;
                }
                
                fields[fieldId] = field;
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

    // ===== OBJECT INSTANCE METHODS =====

    async openInstancesList(typeId) {
        this.currentObjectTypeId = typeId;
        
        // Clear navigation stack - this is a fresh navigation from toolkit
        this.navigationStack = [];
        this.relationshipDisplayNames = {};

        // Load the object type
        const typeSnap = await db.ref(`objectTypes/${typeId}`).once("value");
        if (!typeSnap.exists()) {
            this.showToast("Object type not found", "error");
            return;
        }

        this.currentObjectType = typeSnap.val();
        this.instancesTypeName.textContent = this.currentObjectType.name;

        soundManager.play('bite');
        this.showInstancesView();
        this.listenToInstances();
    }

    showInstancesView() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        this.objectInstancesView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
        this.gordataView.classList.add("hidden");
        this.objectInstancesView.classList.remove("hidden");
    }

    closeInstancesList() {
        this.objectInstancesView.classList.add("hidden");
        this.homeView.classList.remove("hidden");
        
        // Clean up listener
        if (this.instancesListener) {
            db.ref("objects").off("value", this.instancesListener);
            this.instancesListener = null;
        }
        
        // Reset view state
        this.currentView = 'card';
        this.selectedInstanceIds.clear();
        this.instancesSearchInput.value = '';
        this.sortField = null;
        this.sortDirection = 'asc';
        this.cardViewBtn.classList.add('active');
        this.tableViewBtn.classList.remove('active');
        this.bulkDeleteBtn.classList.add('hidden');
        this.navigationStack = []; // Clear navigation history
        this.relationshipDisplayNames = {}; // Clear relationship cache
        
        this.switchTab('toolkit');
    }

    listenToInstances() {
        if (this.instancesListener) {
            db.ref("objects").off("value", this.instancesListener);
        }

        this.instancesListener = db.ref("objects")
            .orderByChild("typeId")
            .equalTo(this.currentObjectTypeId)
            .on("value", snap => {
                this.renderInstances(snap);
            });
    }

    async renderInstances(snap) {
        if (!snap.exists()) {
            this.currentInstances = [];
            this.filteredInstances = [];
            const emptyMsg = document.createElement("div");
            emptyMsg.className = "instance-empty";
            emptyMsg.textContent = `No ${this.currentObjectType.name} instances yet. Create one to get started!`;
            
            this.instancesList.innerHTML = "";
            this.instancesTableBody.innerHTML = "";
            this.instancesList.appendChild(emptyMsg);
            return;
        }

        const instances = [];
        snap.forEach(instanceSnap => {
            instances.push({
                id: instanceSnap.key,
                ...instanceSnap.val()
            });
        });

        // Sort by most recent
        instances.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        // Store for visualization and filtering
        this.currentInstances = instances;
        this.filteredInstances = instances;

        // Load relationship display names
        await this.loadRelationshipDisplayNames();

        // Render based on current view
        this.renderCurrentView();
    }

    async loadRelationshipDisplayNames() {
        this.relationshipDisplayNames = {};
        
        if (!this.currentObjectType.fields) return;
        
        // Find all relationship fields
        const relationshipFields = Object.entries(this.currentObjectType.fields)
            .filter(([id, field]) => field.type === 'relationship' && field.targetType)
            .map(([id, field]) => ({ id, ...field }));
        
        if (relationshipFields.length === 0) return;
        
        // Collect all unique instance IDs that we need to look up
        const instanceIdsToLoad = new Set();
        this.currentInstances.forEach(instance => {
            if (!instance.data) return;
            relationshipFields.forEach(field => {
                const relatedId = instance.data[field.id];
                if (relatedId) {
                    instanceIdsToLoad.add(relatedId);
                }
            });
        });
        
        // Load all related instances
        const loadPromises = Array.from(instanceIdsToLoad).map(async (instanceId) => {
            try {
                const snap = await db.ref(`objects/${instanceId}`).once('value');
                if (snap.exists()) {
                    const instance = snap.val();
                    let displayName = instanceId.substring(0, 8);
                    
                    if (instance.data) {
                        // Try to find a good display name
                        // Priority: first text field, then first field with value
                        const values = Object.values(instance.data);
                        const textValue = values.find(v => typeof v === 'string' && v.trim());
                        const firstValue = values.find(v => v && v !== "");
                        
                        if (textValue) {
                            displayName = String(textValue).substring(0, 50);
                        } else if (firstValue) {
                            displayName = String(firstValue).substring(0, 50);
                        }
                    }
                    
                    this.relationshipDisplayNames[instanceId] = displayName;
                }
            } catch (err) {
                console.error(`Failed to load instance ${instanceId}:`, err);
            }
        });
        
        await Promise.all(loadPromises);
    }

    renderCurrentView() {
        if (this.currentView === 'card') {
            this.renderCardView();
        } else {
            this.renderTableView();
        }
    }

    renderCardView() {
        this.instancesList.innerHTML = "";
        
        this.filteredInstances.forEach(instance => {
            this.renderInstanceCard(instance);
        });
    }

    renderTableView() {
        // Render table headers
        this.instancesTableHead.innerHTML = "";
        const headerRow = document.createElement("tr");

        // Checkbox column
        const checkboxTh = document.createElement("th");
        const selectAllCheckbox = document.createElement("input");
        selectAllCheckbox.type = "checkbox";
        selectAllCheckbox.className = "table-checkbox";
        selectAllCheckbox.onchange = (e) => this.toggleSelectAll(e.target.checked);
        checkboxTh.appendChild(selectAllCheckbox);
        headerRow.appendChild(checkboxTh);

        // ID column
        const idTh = document.createElement("th");
        idTh.textContent = "ID";
        idTh.className = "sortable";
        idTh.onclick = () => this.sortTable('id');
        headerRow.appendChild(idTh);

        // Field columns
        if (this.currentObjectType.fields) {
            const fieldsArray = Object.entries(this.currentObjectType.fields).map(([id, field]) => ({
                id,
                ...field
            }));
            fieldsArray.sort((a, b) => (a.order || 0) - (b.order || 0));

            fieldsArray.forEach(field => {
                const th = document.createElement("th");
                th.textContent = field.name;
                th.className = "sortable";
                th.dataset.fieldId = field.id;
                th.onclick = () => this.sortTable(field.id);
                headerRow.appendChild(th);
            });
        }

        // Date column
        const dateTh = document.createElement("th");
        dateTh.textContent = "Created";
        dateTh.className = "sortable";
        dateTh.onclick = () => this.sortTable('createdAt');
        headerRow.appendChild(dateTh);

        // Actions column
        const actionsTh = document.createElement("th");
        actionsTh.textContent = "Actions";
        headerRow.appendChild(actionsTh);

        this.instancesTableHead.appendChild(headerRow);

        // Render table body
        this.instancesTableBody.innerHTML = "";
        
        this.filteredInstances.forEach(instance => {
            this.renderTableRow(instance);
        });
    }

    renderTableRow(instance) {
        const row = document.createElement("tr");
        row.dataset.instanceId = instance.id;
        if (this.selectedInstanceIds.has(instance.id)) {
            row.classList.add("selected");
        }

        // Checkbox cell
        const checkboxTd = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "table-checkbox";
        checkbox.checked = this.selectedInstanceIds.has(instance.id);
        checkbox.onchange = (e) => this.toggleSelectInstance(instance.id, e.target.checked);
        checkboxTd.appendChild(checkbox);
        row.appendChild(checkboxTd);

        // ID cell
        const idTd = document.createElement("td");
        idTd.textContent = instance.id.substring(0, 8);
        idTd.style.fontFamily = "monospace";
        idTd.style.color = "#64748b";
        idTd.style.fontSize = "12px";
        row.appendChild(idTd);

        // Field cells
        if (this.currentObjectType.fields) {
            const fieldsArray = Object.entries(this.currentObjectType.fields).map(([id, field]) => ({
                id,
                ...field
            }));
            fieldsArray.sort((a, b) => (a.order || 0) - (b.order || 0));

            fieldsArray.forEach(field => {
                const td = document.createElement("td");
                td.className = "table-cell-editable";
                td.dataset.instanceId = instance.id;
                td.dataset.fieldId = field.id;
                
                const value = instance.data ? instance.data[field.id] : null;
                
                if (field.type === 'boolean') {
                    td.className = "table-cell-boolean";
                    if (value !== null && value !== undefined) {
                        const badge = document.createElement("span");
                        badge.className = `table-cell-boolean-badge ${value ? 'true' : 'false'}`;
                        badge.textContent = value ? "Yes" : "No";
                        td.appendChild(badge);
                    } else {
                        td.textContent = "-";
                    }
                } else if (field.type === 'date') {
                    td.textContent = value ? new Date(value).toLocaleDateString() : "-";
                } else if (field.type === 'number') {
                    td.textContent = value !== null && value !== undefined ? value : "-";
                } else if (field.type === 'multiselect') {
                    if (Array.isArray(value) && value.length > 0) {
                        td.textContent = value.join(', ');
                    } else {
                        td.textContent = "-";
                    }
                } else if (field.type === 'url') {
                    if (value) {
                        const link = document.createElement("a");
                        link.href = value;
                        link.textContent = value.length > 30 ? value.substring(0, 30) + '...' : value;
                        link.target = "_blank";
                        link.style.color = "#3b82f6";
                        td.appendChild(link);
                    } else {
                        td.textContent = "-";
                    }
                } else if (field.type === 'image') {
                    if (value) {
                        const img = document.createElement("img");
                        img.src = value;
                        img.style.maxWidth = "60px";
                        img.style.maxHeight = "40px";
                        img.style.borderRadius = "4px";
                        img.onerror = () => {
                            img.style.display = 'none';
                            td.textContent = "Invalid";
                        };
                        td.appendChild(img);
                    } else {
                        td.textContent = "-";
                    }
                } else if (field.type === 'email') {
                    if (value) {
                        const link = document.createElement("a");
                        link.href = `mailto:${value}`;
                        link.textContent = value;
                        link.style.color = "#3b82f6";
                        td.appendChild(link);
                    } else {
                        td.textContent = "-";
                    }
                } else if (field.type === 'phone') {
                    if (value) {
                        const link = document.createElement("a");
                        link.href = `tel:${value}`;
                        link.textContent = value;
                        link.style.color = "#3b82f6";
                        td.appendChild(link);
                    } else {
                        td.textContent = "-";
                    }
                } else if (field.type === 'color') {
                    if (value) {
                        const colorBox = document.createElement("div");
                        colorBox.style.width = "40px";
                        colorBox.style.height = "24px";
                        colorBox.style.backgroundColor = value;
                        colorBox.style.borderRadius = "4px";
                        colorBox.style.border = "1px solid #e2e8f0";
                        colorBox.title = value;
                        td.appendChild(colorBox);
                    } else {
                        td.textContent = "-";
                    }
                } else if (field.type === 'relationship') {
                    if (value) {
                        const displayName = this.relationshipDisplayNames[value] || value.substring(0, 8);
                        const link = document.createElement("a");
                        link.href = "#";
                        link.textContent = displayName;
                        link.style.color = "#3b82f6";
                        link.style.textDecoration = "none";
                        link.title = "Click to view related instance";
                        link.onclick = async (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            await this.openRelatedInstance(value, field.targetType);
                        };
                        td.appendChild(link);
                    } else {
                        td.textContent = "-";
                    }
                } else {
                    td.textContent = value || "-";
                }

                // Click to edit (we'll add this functionality later)
                td.onclick = () => this.editTableCell(instance.id, field.id, field.type);
                
                row.appendChild(td);
            });
        }

        // Created date cell
        const dateTd = document.createElement("td");
        dateTd.textContent = new Date(instance.createdAt).toLocaleDateString();
        dateTd.style.fontSize = "12px";
        dateTd.style.color = "#64748b";
        row.appendChild(dateTd);

        // Actions cell
        const actionsTd = document.createElement("td");
        actionsTd.className = "table-actions-cell";
        
        const editBtn = document.createElement("button");
        editBtn.className = "table-action-btn";
        editBtn.textContent = "Edit";
        editBtn.title = "Edit";
        editBtn.onclick = () => this.openInstance(instance.id);
        
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "table-action-btn delete";
        deleteBtn.textContent = "Delete";
        deleteBtn.title = "Delete";
        deleteBtn.onclick = () => this.quickDeleteInstance(instance.id);
        
        actionsTd.appendChild(editBtn);
        actionsTd.appendChild(deleteBtn);
        row.appendChild(actionsTd);

        this.instancesTableBody.appendChild(row);
    }

    renderInstanceCard(instance) {
        const card = document.createElement("div");
        card.className = "instance-card";
        card.onclick = () => this.openInstance(instance.id);

        const header = document.createElement("div");
        header.className = "instance-header";

        const id = document.createElement("div");
        id.className = "instance-id";
        id.textContent = `#${instance.id.substring(0, 8)}`;

        const date = document.createElement("div");
        date.className = "instance-date";
        const createdDate = new Date(instance.createdAt);
        date.textContent = createdDate.toLocaleDateString();

        header.appendChild(id);
        header.appendChild(date);
        card.appendChild(header);

        // Render fields
        const fieldsDiv = document.createElement("div");
        fieldsDiv.className = "instance-fields";

        if (this.currentObjectType.fields && instance.data) {
            // Get fields in order
            const fieldsArray = Object.entries(this.currentObjectType.fields).map(([id, field]) => ({
                id,
                ...field
            }));
            fieldsArray.sort((a, b) => (a.order || 0) - (b.order || 0));

            fieldsArray.forEach(field => {
                const value = instance.data[field.id];
                if (value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0)) {
                    const fieldDiv = document.createElement("div");
                    fieldDiv.className = "instance-field";

                    const label = document.createElement("div");
                    label.className = "instance-field-label";
                    label.textContent = field.name;

                    const valueDiv = document.createElement("div");
                    valueDiv.className = "instance-field-value";

                    if (field.type === "boolean") {
                        const boolSpan = document.createElement("span");
                        boolSpan.className = `instance-field-value-boolean ${value ? 'true' : 'false'}`;
                        boolSpan.textContent = value ? "Yes" : "No";
                        valueDiv.appendChild(boolSpan);
                    } else if (field.type === "date") {
                        valueDiv.textContent = new Date(value).toLocaleDateString();
                    } else if (field.type === "multiselect") {
                        if (Array.isArray(value)) {
                            valueDiv.textContent = value.join(', ');
                        }
                    } else if (field.type === "url") {
                        const link = document.createElement("a");
                        link.href = value;
                        link.textContent = value;
                        link.target = "_blank";
                        link.style.color = "#3b82f6";
                        link.onclick = (e) => e.stopPropagation();
                        valueDiv.appendChild(link);
                    } else if (field.type === "image") {
                        const img = document.createElement("img");
                        img.src = value;
                        img.style.maxWidth = "100%";
                        img.style.maxHeight = "120px";
                        img.style.borderRadius = "8px";
                        img.style.marginTop = "4px";
                        img.onerror = () => {
                            img.style.display = 'none';
                            valueDiv.textContent = "Invalid image URL";
                        };
                        valueDiv.appendChild(img);
                    } else if (field.type === "email") {
                        const link = document.createElement("a");
                        link.href = `mailto:${value}`;
                        link.textContent = value;
                        link.style.color = "#3b82f6";
                        link.onclick = (e) => e.stopPropagation();
                        valueDiv.appendChild(link);
                    } else if (field.type === "phone") {
                        const link = document.createElement("a");
                        link.href = `tel:${value}`;
                        link.textContent = value;
                        link.style.color = "#3b82f6";
                        link.onclick = (e) => e.stopPropagation();
                        valueDiv.appendChild(link);
                    } else if (field.type === "color") {
                        const colorBox = document.createElement("div");
                        colorBox.style.width = "60px";
                        colorBox.style.height = "30px";
                        colorBox.style.backgroundColor = value;
                        colorBox.style.borderRadius = "6px";
                        colorBox.style.border = "2px solid #e2e8f0";
                        colorBox.style.marginTop = "4px";
                        valueDiv.appendChild(colorBox);
                        const colorText = document.createElement("div");
                        colorText.textContent = value;
                        colorText.style.fontSize = "11px";
                        colorText.style.color = "#64748b";
                        colorText.style.marginTop = "4px";
                        valueDiv.appendChild(colorText);
                    } else if (field.type === "relationship") {
                        const displayName = this.relationshipDisplayNames[value] || value.substring(0, 8);
                        const link = document.createElement("a");
                        link.href = "#";
                        link.textContent = displayName;
                        link.style.color = "#3b82f6";
                        link.style.textDecoration = "none";
                        link.onclick = async (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            await this.openRelatedInstance(value, field.targetType);
                        };
                        valueDiv.appendChild(link);
                    } else {
                        valueDiv.textContent = value;
                    }

                    fieldDiv.appendChild(label);
                    fieldDiv.appendChild(valueDiv);
                    fieldsDiv.appendChild(fieldDiv);
                }
            });
        }

        card.appendChild(fieldsDiv);
        this.instancesList.appendChild(card);
    }

    createInstance() {
        this.currentInstanceId = null;
        this.instanceEditorContext.textContent = `New Instance`;
        this.instanceEditorTitle.textContent = this.currentObjectType.name;
        this.deleteInstanceBtn.style.display = "none";
        this.showInstanceEditor();
        this.renderInstanceForm();
    }

    async openInstance(instanceId) {
        this.currentInstanceId = instanceId;

        const instanceSnap = await db.ref(`objects/${instanceId}`).once("value");
        if (!instanceSnap.exists()) {
            this.showToast("Instance not found", "error");
            return;
        }

        const instance = instanceSnap.val();
        this.instanceEditorContext.textContent = `Editing Instance`;
        // Try to get first field value as title, or use type name
        const firstValue = instance.data ? Object.values(instance.data).find(v => v && v !== '') : null;
        this.instanceEditorTitle.textContent = firstValue ? String(firstValue).substring(0, 50) : this.currentObjectType.name;
        this.deleteInstanceBtn.style.display = "block";
        this.showInstanceEditor();
        this.renderInstanceForm(instance.data);
    }

    showInstanceEditor() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        this.objectInstancesView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
        this.objectInstancesView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.objectInstanceEditorView.classList.remove("hidden");

        soundManager.play('bite');
    }

    closeInstanceEditor() {
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
        this.objectInstancesView.classList.remove("hidden");
        
        // Check if we need to restore previous state from navigation stack
        if (this.navigationStack.length > 0) {
            const previousState = this.navigationStack.pop();
            
            // Restore the previous object type and instances
            this.currentObjectTypeId = previousState.objectTypeId;
            this.currentObjectType = previousState.objectType;
            this.currentInstances = previousState.instances;
            this.filteredInstances = previousState.filteredInstances;
            this.currentView = previousState.viewMode;
            this.relationshipDisplayNames = previousState.relationshipDisplayNames;
            
            // Update the UI to reflect the restored state
            this.instancesTypeName.textContent = this.currentObjectType.name;
            
            // Re-render the view
            this.renderCurrentView();
        }
    }

    renderInstanceForm(existingData = {}) {
        this.instanceForm.innerHTML = "";

        if (!this.currentObjectType.fields) {
            const noFields = document.createElement("div");
            noFields.className = "instance-empty";
            noFields.textContent = "This object type has no fields defined.";
            this.instanceForm.appendChild(noFields);
            return;
        }

        // Get fields in order
        const fieldsArray = Object.entries(this.currentObjectType.fields).map(([id, field]) => ({
            id,
            ...field
        }));
        fieldsArray.sort((a, b) => (a.order || 0) - (b.order || 0));

        fieldsArray.forEach(field => {
            const fieldDiv = document.createElement("div");
            fieldDiv.className = "form-field";

            const labelDiv = document.createElement("div");
            labelDiv.style.display = "flex";
            labelDiv.style.justifyContent = "space-between";
            labelDiv.style.alignItems = "baseline";

            const label = document.createElement("div");
            label.className = "form-field-label";
            label.textContent = field.name;

            const typeLabel = document.createElement("div");
            typeLabel.className = "form-field-type";
            typeLabel.textContent = field.type;

            labelDiv.appendChild(label);
            labelDiv.appendChild(typeLabel);

            let input;
            const value = existingData[field.id];

            if (field.type === "text") {
                input = document.createElement("textarea");
                input.className = "form-field-input form-field-textarea";
                input.value = value || "";
                input.dataset.fieldId = field.id;
            } else if (field.type === "number") {
                input = document.createElement("input");
                input.type = "number";
                input.step = "any";
                input.className = "form-field-input";
                input.value = value || "";
                input.dataset.fieldId = field.id;
            } else if (field.type === "date") {
                input = document.createElement("input");
                input.type = "date";
                input.className = "form-field-input";
                input.value = value || "";
                input.dataset.fieldId = field.id;
            } else if (field.type === "boolean") {
                input = document.createElement("input");
                input.type = "checkbox";
                input.className = "form-field-checkbox";
                input.checked = value === true;
                input.dataset.fieldId = field.id;
            } else if (field.type === "dropdown") {
                input = document.createElement("select");
                input.className = "form-field-input";
                input.dataset.fieldId = field.id;
                
                // Add empty option
                const emptyOption = document.createElement("option");
                emptyOption.value = "";
                emptyOption.textContent = "-- Select --";
                input.appendChild(emptyOption);
                
                // Add options
                if (field.options && field.options.length > 0) {
                    field.options.forEach(opt => {
                        const option = document.createElement("option");
                        option.value = opt;
                        option.textContent = opt;
                        if (value === opt) option.selected = true;
                        input.appendChild(option);
                    });
                }
            } else if (field.type === "multiselect") {
                input = document.createElement("div");
                input.className = "multiselect-container";
                input.dataset.fieldId = field.id;
                
                const selectedValues = Array.isArray(value) ? value : [];
                
                if (field.options && field.options.length > 0) {
                    field.options.forEach(opt => {
                        const checkboxDiv = document.createElement("div");
                        checkboxDiv.className = "multiselect-option";
                        
                        const checkbox = document.createElement("input");
                        checkbox.type = "checkbox";
                        checkbox.value = opt;
                        checkbox.checked = selectedValues.includes(opt);
                        checkbox.dataset.option = opt;
                        
                        const label = document.createElement("label");
                        label.textContent = opt;
                        label.style.marginLeft = "8px";
                        label.style.cursor = "pointer";
                        label.onclick = () => checkbox.click();
                        
                        checkboxDiv.appendChild(checkbox);
                        checkboxDiv.appendChild(label);
                        input.appendChild(checkboxDiv);
                    });
                }
            } else if (field.type === "url") {
                input = document.createElement("input");
                input.type = "url";
                input.className = "form-field-input";
                input.placeholder = "https://example.com";
                input.value = value || "";
                input.dataset.fieldId = field.id;
            } else if (field.type === "image") {
                input = document.createElement("input");
                input.type = "url";
                input.className = "form-field-input";
                input.placeholder = "https://example.com/image.jpg";
                input.value = value || "";
                input.dataset.fieldId = field.id;
                
                // Add image preview
                if (value) {
                    const preview = document.createElement("img");
                    preview.src = value;
                    preview.className = "image-preview";
                    preview.onerror = () => preview.style.display = 'none';
                    fieldDiv.appendChild(preview);
                }
            } else if (field.type === "email") {
                input = document.createElement("input");
                input.type = "email";
                input.className = "form-field-input";
                input.placeholder = "email@example.com";
                input.value = value || "";
                input.dataset.fieldId = field.id;
            } else if (field.type === "phone") {
                input = document.createElement("input");
                input.type = "tel";
                input.className = "form-field-input";
                input.placeholder = "(123) 456-7890";
                input.value = value || "";
                input.dataset.fieldId = field.id;
            } else if (field.type === "color") {
                input = document.createElement("input");
                input.type = "color";
                input.className = "form-field-color";
                input.value = value || "#3b82f6";
                input.dataset.fieldId = field.id;
            } else if (field.type === "relationship") {
                input = document.createElement("select");
                input.className = "form-field-input";
                input.dataset.fieldId = field.id;
                
                // Add empty option
                const emptyOption = document.createElement("option");
                emptyOption.value = "";
                emptyOption.textContent = "-- Select --";
                input.appendChild(emptyOption);
                
                // Load instances of target type
                if (field.targetType) {
                    this.loadRelationshipOptions(input, field.targetType, value);
                }
            }

            fieldDiv.appendChild(labelDiv);
            fieldDiv.appendChild(input);
            this.instanceForm.appendChild(fieldDiv);
        });
    }

    async loadRelationshipOptions(selectElement, targetTypeId, selectedInstanceId = null) {
        try {
            const instancesSnap = await db.ref("objects")
                .orderByChild("typeId")
                .equalTo(targetTypeId)
                .once("value");
            
            if (instancesSnap.exists()) {
                instancesSnap.forEach(instanceSnap => {
                    const instance = instanceSnap.val();
                    const option = document.createElement("option");
                    option.value = instanceSnap.key;
                    
                    // Try to create a display name from instance data
                    let displayName = instanceSnap.key.substring(0, 8);
                    if (instance.data) {
                        // Use first non-empty field as display
                        const firstValue = Object.values(instance.data).find(v => v && v !== "");
                        if (firstValue) {
                            displayName = String(firstValue).substring(0, 50);
                        }
                    }
                    
                    option.textContent = displayName;
                    if (instanceSnap.key === selectedInstanceId) {
                        option.selected = true;
                    }
                    selectElement.appendChild(option);
                });
            }
        } catch (err) {
            console.error("Failed to load relationship options:", err);
        }
    }

    async saveInstance() {
        // Collect field data
        const data = {};
        
        // Get all field definitions
        const fieldsArray = Object.entries(this.currentObjectType.fields).map(([id, field]) => ({
            id,
            ...field
        }));
        
        fieldsArray.forEach(field => {
            const fieldId = field.id;
            
            if (field.type === "multiselect") {
                // Handle multiselect specially
                const container = this.instanceForm.querySelector(`[data-field-id="${fieldId}"]`);
                if (container) {
                    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
                    data[fieldId] = Array.from(checkboxes).map(cb => cb.value);
                }
            } else {
                // Handle other field types
                const input = this.instanceForm.querySelector(`[data-field-id="${fieldId}"]`);
                if (!input) return;
                
                if (input.type === "checkbox") {
                    data[fieldId] = input.checked;
                } else if (input.type === "number") {
                    const value = input.value.trim();
                    data[fieldId] = value ? parseFloat(value) : null;
                } else {
                    data[fieldId] = input.value.trim();
                }
            }
        });

        const instance = {
            typeId: this.currentObjectTypeId,
            typeName: this.currentObjectType.name,
            authorId: this.currentUser.id,
            data: data,
            updatedAt: Date.now()
        };

        try {
            if (this.currentInstanceId) {
                // Update existing
                await db.ref(`objects/${this.currentInstanceId}`).update(instance);
                this.showToast("Instance updated", "success");
            } else {
                // Create new
                instance.createdAt = Date.now();
                await db.ref("objects").push(instance);
                this.showToast("Instance created", "success");
            }

            soundManager.play('accepted');
            this.closeInstanceEditor();
        } catch (err) {
            console.error("Failed to save instance:", err);
            this.showToast("Failed to save instance", "error");
        }
    }

    async deleteInstance() {
        if (!this.currentInstanceId) return;

        const confirmed = confirm("Are you sure you want to delete this instance? This cannot be undone.");
        if (!confirmed) return;

        try {
            await db.ref(`objects/${this.currentInstanceId}`).remove();
            this.showToast("Instance deleted", "success");
            this.closeInstanceEditor();
        } catch (err) {
            console.error("Failed to delete instance:", err);
            this.showToast("Failed to delete instance", "error");
        }
    }

    // ===== TABLE VIEW METHODS =====

    switchInstanceView(view) {
        this.currentView = view;
        
        if (view === 'card') {
            this.cardViewBtn.classList.add('active');
            this.tableViewBtn.classList.remove('active');
            this.instancesList.classList.remove('hidden');
            this.instancesTableWrapper.classList.add('hidden');
            this.renderCardView();
        } else {
            this.cardViewBtn.classList.remove('active');
            this.tableViewBtn.classList.add('active');
            this.instancesList.classList.add('hidden');
            this.instancesTableWrapper.classList.remove('hidden');
            this.renderTableView();
        }
    }

    filterInstances() {
        const query = this.instancesSearchInput.value.toLowerCase().trim();
        
        if (!query) {
            this.filteredInstances = this.currentInstances;
        } else {
            this.filteredInstances = this.currentInstances.filter(instance => {
                // Search in ID
                if (instance.id.toLowerCase().includes(query)) return true;
                
                // Search in field values
                if (instance.data) {
                    return Object.values(instance.data).some(value => {
                        if (value === null || value === undefined) return false;
                        return String(value).toLowerCase().includes(query);
                    });
                }
                
                return false;
            });
        }
        
        this.renderCurrentView();
    }

    sortTable(field) {
        // Toggle sort direction if clicking same field
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }

        // Sort the filtered instances
        this.filteredInstances.sort((a, b) => {
            let aValue, bValue;

            if (field === 'id') {
                aValue = a.id;
                bValue = b.id;
            } else if (field === 'createdAt') {
                aValue = a.createdAt || 0;
                bValue = b.createdAt || 0;
            } else {
                // Field value
                aValue = a.data ? a.data[field] : null;
                bValue = b.data ? b.data[field] : null;
            }

            // Handle null/undefined
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            // Compare
            let comparison = 0;
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                comparison = aValue === bValue ? 0 : aValue ? -1 : 1;
            } else {
                comparison = String(aValue).localeCompare(String(bValue));
            }

            return this.sortDirection === 'asc' ? comparison : -comparison;
        });

        // Update table headers to show sort indicator
        const headers = this.instancesTableHead.querySelectorAll('th.sortable');
        headers.forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            const thFieldId = th.dataset.fieldId || th.textContent.toLowerCase();
            if ((field === 'id' && th.textContent === 'ID') ||
                (field === 'createdAt' && th.textContent === 'Created') ||
                th.dataset.fieldId === field) {
                th.classList.add(`sorted-${this.sortDirection}`);
            }
        });

        this.renderTableView();
    }

    toggleSelectAll(checked) {
        if (checked) {
            this.filteredInstances.forEach(instance => {
                this.selectedInstanceIds.add(instance.id);
            });
        } else {
            this.selectedInstanceIds.clear();
        }

        this.renderTableView();
        this.updateBulkDeleteButton();
    }

    toggleSelectInstance(instanceId, checked) {
        if (checked) {
            this.selectedInstanceIds.add(instanceId);
        } else {
            this.selectedInstanceIds.delete(instanceId);
        }

        // Update row styling
        const row = this.instancesTableBody.querySelector(`tr[data-instance-id="${instanceId}"]`);
        if (row) {
            if (checked) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
        }

        this.updateBulkDeleteButton();
    }

    updateBulkDeleteButton() {
        if (this.selectedInstanceIds.size > 0) {
            this.bulkDeleteBtn.classList.remove('hidden');
            this.bulkDeleteBtn.textContent = `Delete ${this.selectedInstanceIds.size} Selected`;
        } else {
            this.bulkDeleteBtn.classList.add('hidden');
        }
    }

    async bulkDeleteInstances() {
        const count = this.selectedInstanceIds.size;
        const confirmed = confirm(`Are you sure you want to delete ${count} instance${count === 1 ? '' : 's'}? This cannot be undone.`);
        
        if (!confirmed) return;

        try {
            const deletePromises = Array.from(this.selectedInstanceIds).map(id => 
                db.ref(`objects/${id}`).remove()
            );
            
            await Promise.all(deletePromises);
            
            this.selectedInstanceIds.clear();
            this.updateBulkDeleteButton();
            this.showToast(`Deleted ${count} instance${count === 1 ? '' : 's'}`, "success");
        } catch (err) {
            console.error("Failed to delete instances:", err);
            this.showToast("Failed to delete instances", "error");
        }
    }

    async quickDeleteInstance(instanceId) {
        const confirmed = confirm("Are you sure you want to delete this instance? This cannot be undone.");
        if (!confirmed) return;

        try {
            await db.ref(`objects/${instanceId}`).remove();
            this.showToast("Instance deleted", "success");
        } catch (err) {
            console.error("Failed to delete instance:", err);
            this.showToast("Failed to delete instance", "error");
        }
    }

    editTableCell(instanceId, fieldId, fieldType) {
        // Find the cell
        const cell = this.instancesTableBody.querySelector(
            `td[data-instance-id="${instanceId}"][data-field-id="${fieldId}"]`
        );
        
        if (!cell || cell.classList.contains('table-cell-boolean')) return; // Skip boolean for now

        const currentValue = cell.textContent === '-' ? '' : cell.textContent;
        
        // Create input
        let input;
        if (fieldType === 'number') {
            input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.value = currentValue;
        } else if (fieldType === 'date') {
            input = document.createElement('input');
            input.type = 'date';
            // Parse the displayed date back to YYYY-MM-DD
            if (currentValue && currentValue !== '-') {
                const date = new Date(currentValue);
                input.value = date.toISOString().split('T')[0];
            }
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.value = currentValue;
        }
        
        input.className = 'table-cell-input';
        
        // Save on blur or enter
        const saveEdit = async () => {
            let newValue = input.value.trim();
            
            if (fieldType === 'number') {
                newValue = newValue ? parseFloat(newValue) : null;
            }
            
            try {
                await db.ref(`objects/${instanceId}/data/${fieldId}`).set(newValue);
                // Cell will update automatically from Firebase listener
            } catch (err) {
                console.error("Failed to update cell:", err);
                this.showToast("Failed to update", "error");
            }
        };
        
        input.onblur = saveEdit;
        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        };
        
        // Replace cell content with input
        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();
        input.select();
    }

    exportToCSV() {
        if (this.currentInstances.length === 0) {
            this.showToast("No data to export", "error");
            return;
        }

        // Build CSV header
        const headers = ['ID'];
        const fieldsArray = [];
        
        if (this.currentObjectType.fields) {
            const fields = Object.entries(this.currentObjectType.fields).map(([id, field]) => ({
                id,
                ...field
            }));
            fields.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            fields.forEach(field => {
                headers.push(field.name);
                fieldsArray.push(field);
            });
        }
        
        headers.push('Created');

        // Build CSV rows
        const rows = [headers];
        
        this.currentInstances.forEach(instance => {
            const row = [instance.id];
            
            fieldsArray.forEach(field => {
                const value = instance.data ? instance.data[field.id] : null;
                
                if (value === null || value === undefined) {
                    row.push('');
                } else if (field.type === 'date') {
                    row.push(new Date(value).toLocaleDateString());
                } else if (field.type === 'boolean') {
                    row.push(value ? 'Yes' : 'No');
                } else {
                    // Escape commas and quotes
                    const str = String(value);
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        row.push(`"${str.replace(/"/g, '""')}"`);
                    } else {
                        row.push(str);
                    }
                }
            });
            
            row.push(new Date(instance.createdAt).toLocaleString());
            rows.push(row);
        });

        // Convert to CSV string
        const csvContent = rows.map(row => row.join(',')).join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.currentObjectType.name}_${Date.now()}.csv`;
        link.click();
        
        this.showToast("CSV exported successfully", "success");
        soundManager.play('accepted');
    }

    async openRelatedInstance(instanceId, targetTypeId) {
        try {
            // Save current state to navigation stack
            this.navigationStack.push({
                objectTypeId: this.currentObjectTypeId,
                objectType: this.currentObjectType,
                instances: this.currentInstances,
                filteredInstances: this.filteredInstances,
                viewMode: this.currentView,
                relationshipDisplayNames: {...this.relationshipDisplayNames}
            });

            // Load the target type
            const typeSnap = await db.ref(`objectTypes/${targetTypeId}`).once("value");
            if (!typeSnap.exists()) {
                this.showToast("Related object type not found", "error");
                this.navigationStack.pop(); // Remove the state we just pushed
                return;
            }

            // Load the instance
            const instanceSnap = await db.ref(`objects/${instanceId}`).once("value");
            if (!instanceSnap.exists()) {
                this.showToast("Related instance not found", "error");
                this.navigationStack.pop(); // Remove the state we just pushed
                return;
            }

            // Set up state as if we opened this type's instances
            this.currentObjectType = typeSnap.val();
            this.currentObjectTypeId = targetTypeId;
            
            // Load all instances of this type
            const instancesSnap = await db.ref("objects")
                .orderByChild("typeId")
                .equalTo(targetTypeId)
                .once("value");

            const instances = [];
            instancesSnap.forEach(snap => {
                instances.push({
                    id: snap.key,
                    ...snap.val()
                });
            });
            instances.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            this.currentInstances = instances;
            this.filteredInstances = instances;

            // Load relationship display names for the new type
            await this.loadRelationshipDisplayNames();

            // Open the specific instance in the editor
            this.currentInstanceId = instanceId;
            this.instanceEditorTitle.textContent = `View ${this.currentObjectType.name}`;
            this.deleteInstanceBtn.style.display = "block";
            
            soundManager.play('bite');
            this.showInstanceEditor();
            this.renderInstanceForm(instanceSnap.val().data);
        } catch (err) {
            console.error("Failed to open related instance:", err);
            this.showToast("Failed to open related instance", "error");
            // Try to restore state if something went wrong
            if (this.navigationStack.length > 0) {
                this.navigationStack.pop();
            }
        }
    }

    // ===== DATA VISUALIZATION METHODS =====

    openVisualization() {
        if (this.currentInstances.length === 0) {
            this.showToast("No data to visualize. Create some instances first!", "error");
            return;
        }

        this.visualizationTypeName.textContent = `${this.currentObjectType.name} Data`;
        this.showVisualizationView();
        this.setupVisualizationControls();
        this.updateChart();
    }

    showVisualizationView() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        this.objectInstancesView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.gordataView.classList.add("hidden");
        this.dataVisualizationView.classList.remove("hidden");

        soundManager.play('bite');
    }

    closeVisualization() {
        // Destroy existing chart
        if (this.currentChart) {
            this.currentChart.destroy();
            this.currentChart = null;
        }

        this.dataVisualizationView.classList.add("hidden");
        this.objectInstancesView.classList.remove("hidden");
    }

    setupVisualizationControls() {
        // Populate axis selects with field options
        this.xAxisSelect.innerHTML = "";
        this.yAxisSelect.innerHTML = "";

        if (!this.currentObjectType.fields) return;

        // Get fields in order
        const fieldsArray = Object.entries(this.currentObjectType.fields).map(([id, field]) => ({
            id,
            ...field
        }));
        fieldsArray.sort((a, b) => (a.order || 0) - (b.order || 0));

        // Add categorical fields to X axis (date, text, dropdown, relationship)
        const xFields = fieldsArray.filter(f => 
            f.type === 'date' || 
            f.type === 'text' || 
            f.type === 'dropdown' || 
            f.type === 'relationship'
        );
        xFields.forEach(field => {
            const option = document.createElement("option");
            option.value = field.id;
            option.textContent = `${field.name} (${field.type})`;
            this.xAxisSelect.appendChild(option);
        });

        // Add number and boolean fields to Y axis
        const yFields = fieldsArray.filter(f => f.type === 'number' || f.type === 'boolean');
        yFields.forEach(field => {
            const option = document.createElement("option");
            option.value = field.id;
            option.textContent = `${field.name} (${field.type})`;
            this.yAxisSelect.appendChild(option);
        });

        // If no number/boolean fields, allow all fields on Y axis
        if (yFields.length === 0) {
            fieldsArray.forEach(field => {
                const option = document.createElement("option");
                option.value = field.id;
                option.textContent = `${field.name} (${field.type})`;
                this.yAxisSelect.appendChild(option);
            });
        }
    }

    async updateChart() {
        const chartType = this.chartTypeSelect.value;
        const xFieldId = this.xAxisSelect.value;
        const yFieldId = this.yAxisSelect.value;
        const aggregation = this.aggregationSelect.value;

        if (!xFieldId || !yFieldId) {
            return;
        }

        // Get field metadata
        const xField = this.currentObjectType.fields[xFieldId];
        const yField = this.currentObjectType.fields[yFieldId];

        // Prepare data (now async to handle relationships)
        const chartData = await this.prepareChartData(xFieldId, yFieldId, xField, yField, aggregation, chartType);

        // Update control visibility based on chart type
        if (chartType === 'pie') {
            this.xAxisGroup.style.display = 'none';
            this.yAxisGroup.style.display = 'block';
            this.aggregationGroup.style.display = 'block';
        } else {
            this.xAxisGroup.style.display = 'block';
            this.yAxisGroup.style.display = 'block';
            this.aggregationGroup.style.display = 'block';
        }

        // Render chart
        this.renderChart(chartType, chartData, xField, yField);

        // Render stats
        this.renderStats(chartData, yField);
    }

    async prepareChartData(xFieldId, yFieldId, xField, yField, aggregation, chartType) {
        const dataPoints = [];

        console.log("Preparing chart data:", {
            xFieldId, yFieldId, 
            xFieldName: xField.name, 
            yFieldName: yField.name,
            xFieldType: xField.type,
            yFieldType: yField.type,
            instances: this.currentInstances.length
        });

        // For relationship fields, we need to resolve instance IDs to display names
        const relationshipCache = {};
        
        if (xField.type === 'relationship' && xField.targetType) {
            try {
                const instancesSnap = await db.ref("objects")
                    .orderByChild("typeId")
                    .equalTo(xField.targetType)
                    .once("value");
                
                instancesSnap.forEach(snap => {
                    const instance = snap.val();
                    let displayName = snap.key.substring(0, 8);
                    if (instance.data) {
                        const firstValue = Object.values(instance.data).find(v => v && v !== "");
                        if (firstValue) {
                            displayName = String(firstValue).substring(0, 50);
                        }
                    }
                    relationshipCache[snap.key] = displayName;
                });
            } catch (err) {
                console.error("Failed to load relationship data:", err);
            }
        }

        this.currentInstances.forEach(instance => {
            if (!instance.data) return;

            const xValue = instance.data[xFieldId];
            const yValue = instance.data[yFieldId];

            if (xValue !== undefined && xValue !== null && yValue !== undefined && yValue !== null) {
                let xLabel = xValue;

                // Format x value
                if (xField.type === 'date') {
                    xLabel = new Date(xValue).toLocaleDateString();
                } else if (xField.type === 'boolean') {
                    xLabel = xValue ? 'Yes' : 'No';
                } else if (xField.type === 'relationship') {
                    xLabel = relationshipCache[xValue] || xValue.substring(0, 8);
                }

                // Convert y value to number if possible
                let yNum = yValue;
                if (yField.type === 'number') {
                    yNum = parseFloat(yValue);
                } else if (yField.type === 'boolean') {
                    yNum = yValue ? 1 : 0;
                }

                dataPoints.push({
                    x: xValue,
                    xLabel: xLabel,
                    y: yNum
                });
            }
        });

        console.log("Data points before aggregation:", dataPoints);

        // Sort by x value for line charts
        if (chartType === 'line' && xField.type === 'date') {
            dataPoints.sort((a, b) => new Date(a.x) - new Date(b.x));
        }

        // Apply aggregation
        if (aggregation !== 'none' && chartType !== 'pie') {
            const aggregated = this.aggregateData(dataPoints, aggregation);
            console.log("Data points after aggregation:", aggregated);
            return aggregated;
        }

        return dataPoints;
    }

    aggregateData(dataPoints, aggregation) {
        // Group by x value
        const groups = {};
        dataPoints.forEach(point => {
            const key = point.xLabel;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(point.y);
        });

        // Aggregate
        const aggregated = [];
        Object.entries(groups).forEach(([xLabel, yValues]) => {
            let value;
            if (aggregation === 'sum') {
                value = yValues.reduce((a, b) => a + b, 0);
            } else if (aggregation === 'avg') {
                value = yValues.reduce((a, b) => a + b, 0) / yValues.length;
            } else if (aggregation === 'count') {
                value = yValues.length;
            } else if (aggregation === 'min') {
                value = Math.min(...yValues);
            } else if (aggregation === 'max') {
                value = Math.max(...yValues);
            }

            aggregated.push({
                xLabel: xLabel,
                y: value
            });
        });

        return aggregated;
    }

    renderChart(chartType, dataPoints, xField, yField) {
        // Destroy existing chart
        if (this.currentChart) {
            this.currentChart.destroy();
        }

        if (dataPoints.length === 0) {
            this.dataChart.parentElement.innerHTML = "<div class='chart-empty'>No data available for selected fields</div>";
            return;
        }

        const ctx = this.dataChart.getContext('2d');

        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error("Chart.js not loaded!");
            this.dataChart.parentElement.innerHTML = "<div class='chart-empty'>Chart.js library not loaded. Please refresh the page.</div>";
            return;
        }

        let chartConfig;

        if (chartType === 'pie') {
            // Pie chart: aggregate by y field value
            const valueCounts = {};
            dataPoints.forEach(point => {
                const key = point.xLabel;
                valueCounts[key] = (valueCounts[key] || 0) + 1;
            });

            chartConfig = {
                type: 'pie',
                data: {
                    labels: Object.keys(valueCounts),
                    datasets: [{
                        data: Object.values(valueCounts),
                        backgroundColor: [
                            '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
                            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            };
        } else if (chartType === 'scatter') {
            // Scatter plot needs {x, y} format, not labels
            chartConfig = {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: `${xField.name} vs ${yField.name}`,
                        data: dataPoints.map((p, index) => ({
                            x: index,  // Use index for categorical X-axis
                            y: p.y
                        })),
                        backgroundColor: '#3b82f6',
                        borderColor: '#3b82f6',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const point = dataPoints[context.dataIndex];
                                    return `${point.xLabel}: ${point.y}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            title: {
                                display: true,
                                text: xField.name
                            },
                            ticks: {
                                callback: function(value, index) {
                                    // Show x labels at appropriate points
                                    if (dataPoints[Math.floor(value)]) {
                                        return dataPoints[Math.floor(value)].xLabel;
                                    }
                                    return '';
                                }
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: yField.name
                            }
                        }
                    }
                }
            };
        } else {
            // Line and Bar charts
            chartConfig = {
                type: chartType,
                data: {
                    labels: dataPoints.map(p => p.xLabel),
                    datasets: [{
                        label: yField.name,
                        data: dataPoints.map(p => p.y),
                        backgroundColor: chartType === 'bar' ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        fill: chartType === 'line',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            };
        }

        try {
            this.currentChart = new Chart(ctx, chartConfig);
            console.log("Chart rendered successfully with", dataPoints.length, "data points");
        } catch (err) {
            console.error("Error rendering chart:", err);
            this.showToast("Error rendering chart", "error");
        }
    }

    renderStats(dataPoints, yField) {
        this.chartStats.innerHTML = "";

        if (dataPoints.length === 0) {
            this.chartStats.innerHTML = "<div class='chart-empty'>No data available</div>";
            return;
        }

        const yValues = dataPoints.map(p => p.y).filter(v => typeof v === 'number');

        if (yValues.length === 0) {
            this.chartStats.innerHTML = "<div class='chart-empty'>No numeric data available</div>";
            return;
        }

        const stats = {
            'Total Data Points': dataPoints.length,
            'Sum': yValues.reduce((a, b) => a + b, 0).toFixed(2),
            'Average': (yValues.reduce((a, b) => a + b, 0) / yValues.length).toFixed(2),
            'Minimum': Math.min(...yValues).toFixed(2),
            'Maximum': Math.max(...yValues).toFixed(2)
        };

        Object.entries(stats).forEach(([label, value]) => {
            const row = document.createElement("div");
            row.className = "stat-row";

            const labelDiv = document.createElement("div");
            labelDiv.className = "stat-label";
            labelDiv.textContent = label;

            const valueDiv = document.createElement("div");
            valueDiv.className = "stat-value";
            valueDiv.textContent = value;

            row.appendChild(labelDiv);
            row.appendChild(valueDiv);
            this.chartStats.appendChild(row);
        });
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
        
        // Update top navigation
        this.updateTopNavigation('profile');
        
        soundManager.play('bite');
    }

    closeProfile() {
        this.currentProfileUserId = null;
        this.showHomeView();
    }

    // ===== GORDATA METHODS =====

    showGordataView() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.activityMenuView.classList.add("hidden");
        this.chatView.classList.add("hidden");
        this.diceView.classList.add("hidden");
        this.collabDocView.classList.add("hidden");
        this.gameView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        this.objectInstancesView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
        this.gordataView.classList.remove("hidden");
        
        // Force edit mode off and synchronize UI state
        this.gordataManager.editMode = false;
        this.gordataManager.gordataControls.classList.remove('active');
        this.gordataManager.toggleEditModeBtn.textContent = 'Edit Layout';
        this.gordataManager.editGordataBtn.textContent = 'Edit Layout';
        this.gordataManager.selectedSockets.clear();
        
        // Initialize Gordata (renders grid and controls)
        this.gordataManager.initialize();
        
        // Update top navigation
        this.updateTopNavigation('gordata');
        
        soundManager.play('bite');
    }

    closeGordata() {
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
        this.objectInstancesView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
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
        this.objectInstancesView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
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
        this.objectInstancesView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
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
        
        // Execute dice actions
        await this.executeDiceActions(value, sides);
    }

    // ===== DICE ACTIONS METHODS =====

    switchDiceTab(tab) {
        // Update tab buttons
        this.diceRollTab.classList.toggle('active', tab === 'roll');
        this.diceHistoryTab.classList.toggle('active', tab === 'history');
        this.diceActionsTab.classList.toggle('active', tab === 'actions');
        
        // Update content
        this.diceRollContent.classList.toggle('hidden', tab !== 'roll');
        this.diceHistoryContent.classList.toggle('hidden', tab !== 'history');
        this.diceActionsContent.classList.toggle('hidden', tab !== 'actions');
        
        // Load actions when switching to actions tab
        if (tab === 'actions') {
            this.loadDiceActions();
        }
    }

    async loadDiceActions() {
        if (!this.currentUser) return;
        
        // Clean up existing listener
        if (this.diceActionsListener) {
            db.ref(`users/${this.currentUser.id}/diceActions`).off('value', this.diceActionsListener);
        }
        
        // Listen to user's dice actions
        this.diceActionsListener = db.ref(`users/${this.currentUser.id}/diceActions`)
            .on('value', (snap) => {
                this.renderDiceActions(snap);
            });
    }

    renderDiceActions(snap) {
        this.diceActionsList.innerHTML = '';
        
        if (!snap.exists()) {
            const empty = document.createElement('div');
            empty.className = 'action-empty';
            empty.textContent = 'No actions connected yet. Create one to automate dice rolls!';
            this.diceActionsList.appendChild(empty);
            return;
        }
        
        const actions = [];
        snap.forEach(actionSnap => {
            actions.push({
                id: actionSnap.key,
                ...actionSnap.val()
            });
        });
        
        // Sort by priority
        actions.sort((a, b) => (a.priority || 999) - (b.priority || 999));
        
        this.diceActions = actions;
        
        actions.forEach(action => {
            this.renderDiceActionCard(action);
        });
    }

    renderDiceActionCard(action) {
        const card = document.createElement('div');
        card.className = `action-card ${action.active ? 'active' : 'inactive'}`;
        
        // Header
        const header = document.createElement('div');
        header.className = 'action-card-header';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'action-name';
        nameDiv.textContent = action.name;
        
        const statusBadge = document.createElement('span');
        statusBadge.className = `action-status ${action.active ? 'active' : 'inactive'}`;
        statusBadge.textContent = action.active ? 'Active' : 'Inactive';
        
        header.appendChild(nameDiv);
        header.appendChild(statusBadge);
        
        // Details
        const details = document.createElement('div');
        details.className = 'action-details';
        
        const targetRow = document.createElement('div');
        targetRow.className = 'action-detail-row';
        targetRow.innerHTML = `<span class="action-detail-label">Target:</span> ${action.targetTypeName || 'Unknown'} -> ${action.targetInstanceName || 'Unknown'}`;
        
        const conditionRow = document.createElement('div');
        conditionRow.className = 'action-detail-row';
        if (action.condition.type === 'always') {
            conditionRow.innerHTML = `<span class="action-detail-label">When:</span> Always`;
        } else {
            conditionRow.innerHTML = `<span class="action-detail-label">When:</span> Roll ${action.condition.operator} ${action.condition.value}`;
        }
        
        const actionRow = document.createElement('div');
        actionRow.className = 'action-detail-row';
        actionRow.innerHTML = `<span class="action-detail-label">Then:</span> ${action.operation.fieldName} ${action.operation.operator} ${action.operation.valueSource === 'roll' ? 'roll value' : action.operation.fixedValue}`;
        
        details.appendChild(targetRow);
        details.appendChild(conditionRow);
        details.appendChild(actionRow);
        
        // Actions
        const actions = document.createElement('div');
        actions.className = 'action-actions';
        
        // Toggle switch
        const toggleDiv = document.createElement('div');
        toggleDiv.className = 'action-toggle';
        const toggleLabel = document.createElement('label');
        toggleLabel.className = 'toggle-switch';
        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.checked = action.active;
        toggleInput.onchange = () => this.toggleDiceAction(action.id, toggleInput.checked);
        const toggleSlider = document.createElement('span');
        toggleSlider.className = 'toggle-slider';
        toggleLabel.appendChild(toggleInput);
        toggleLabel.appendChild(toggleSlider);
        toggleDiv.appendChild(toggleLabel);
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => this.deleteDiceAction(action.id);
        
        actions.appendChild(toggleDiv);
        actions.appendChild(deleteBtn);
        
        card.appendChild(header);
        card.appendChild(details);
        card.appendChild(actions);
        
        this.diceActionsList.appendChild(card);
    }

    async toggleDiceAction(actionId, active) {
        try {
            await db.ref(`users/${this.currentUser.id}/diceActions/${actionId}/active`).set(active);
            this.showToast(active ? 'Action activated' : 'Action deactivated', 'success');
        } catch (err) {
            console.error('Failed to toggle action:', err);
            this.showToast('Failed to update action', 'error');
        }
    }

    async deleteDiceAction(actionId) {
        const confirmed = confirm('Are you sure you want to delete this action?');
        if (!confirmed) return;
        
        try {
            await db.ref(`users/${this.currentUser.id}/diceActions/${actionId}`).remove();
            this.showToast('Action deleted', 'success');
        } catch (err) {
            console.error('Failed to delete action:', err);
            this.showToast('Failed to delete action', 'error');
        }
    }

    openDiceActionBuilder() {
        this.currentDiceActionId = null;
        this.currentActionStep = 1;
        this.actionBuilderTitle.textContent = 'Connect New Action';
        
        // Reset form
        this.actionNameInput.value = '';
        this.actionTargetTypeSelect.value = '';
        this.actionTargetInstanceSelect.innerHTML = '<option value="">-- Select Instance --</option>';
        this.actionFieldSelect.innerHTML = '<option value="">-- Select Field --</option>';
        
        // Load object types
        this.loadActionObjectTypes();
        
        // Show step 1
        this.goToActionStep(1);
        
        // Show builder
        this.diceView.classList.add('hidden');
        this.diceActionBuilder.classList.remove('hidden');
        
        soundManager.play('bite');
    }

    closeDiceActionBuilder() {
        this.diceActionBuilder.classList.add('hidden');
        this.diceView.classList.remove('hidden');
    }

    async loadActionObjectTypes() {
        this.actionTargetTypeSelect.innerHTML = '<option value="">-- Select Type --</option>';
        
        try {
            const snap = await db.ref('objectTypes')
                .orderByChild('authorId')
                .equalTo(this.currentUser.id)
                .once('value');
            
            if (snap.exists()) {
                snap.forEach(typeSnap => {
                    const type = typeSnap.val();
                    const option = document.createElement('option');
                    option.value = typeSnap.key;
                    option.textContent = type.name;
                    option.dataset.type = JSON.stringify(type);
                    this.actionTargetTypeSelect.appendChild(option);
                });
            }
        } catch (err) {
            console.error('Failed to load object types:', err);
        }
    }

    async loadActionTargetInstances() {
        const typeId = this.actionTargetTypeSelect.value;
        this.actionTargetInstanceSelect.innerHTML = '<option value="">-- Select Instance --</option>';
        this.actionFieldSelect.innerHTML = '<option value="">-- Select Field --</option>';
        
        if (!typeId) return;
        
        // Get the selected type data
        const selectedOption = this.actionTargetTypeSelect.selectedOptions[0];
        const typeData = JSON.parse(selectedOption.dataset.type || '{}');
        
        // Load instances
        try {
            const snap = await db.ref('objects')
                .orderByChild('typeId')
                .equalTo(typeId)
                .once('value');
            
            if (snap.exists()) {
                snap.forEach(instanceSnap => {
                    const instance = instanceSnap.val();
                    const option = document.createElement('option');
                    option.value = instanceSnap.key;
                    
                    // Use first field value as display name
                    let displayName = instanceSnap.key.substring(0, 8);
                    if (instance.data) {
                        const firstValue = Object.values(instance.data).find(v => v && v !== '');
                        if (firstValue) {
                            displayName = String(firstValue).substring(0, 50);
                        }
                    }
                    
                    option.textContent = displayName;
                    option.dataset.instance = JSON.stringify(instance);
                    this.actionTargetInstanceSelect.appendChild(option);
                });
            }
        } catch (err) {
            console.error('Failed to load instances:', err);
        }
        
        // Load fields for step 3
        if (typeData.fields) {
            const fieldsArray = Object.entries(typeData.fields).map(([id, field]) => ({
                id,
                ...field
            }));
            fieldsArray.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            // Only show number fields for now
            fieldsArray.filter(f => f.type === 'number').forEach(field => {
                const option = document.createElement('option');
                option.value = field.id;
                option.textContent = `${field.name} (${field.type})`;
                option.dataset.fieldName = field.name;
                this.actionFieldSelect.appendChild(option);
            });
        }
    }

    goToActionStep(step) {
        this.currentActionStep = step;
        
        // Hide all steps
        this.actionStep1.classList.add('hidden');
        this.actionStep2.classList.add('hidden');
        this.actionStep3.classList.add('hidden');
        
        // Show current step
        if (step === 1) {
            this.actionStep1.classList.remove('hidden');
        } else if (step === 2) {
            this.actionStep2.classList.remove('hidden');
        } else if (step === 3) {
            this.actionStep3.classList.remove('hidden');
        }
        
        // Update progress
        const progress = (step / 3) * 100;
        this.actionProgressFill.style.width = `${progress}%`;
        this.actionProgressText.textContent = `Step ${step} of 3`;
    }

    async saveDiceAction() {
        // Collect data
        const name = this.actionNameInput.value.trim();
        if (!name) {
            this.showToast('Please enter an action name', 'error');
            return;
        }
        
        const targetTypeId = this.actionTargetTypeSelect.value;
        const targetInstanceId = this.actionTargetInstanceSelect.value;
        if (!targetTypeId || !targetInstanceId) {
            this.showToast('Please select a target', 'error');
            return;
        }
        
        const targetTypeName = this.actionTargetTypeSelect.selectedOptions[0].textContent;
        const targetInstanceName = this.actionTargetInstanceSelect.selectedOptions[0].textContent;
        
        // Condition
        const conditionType = document.querySelector('input[name="conditionType"]:checked').value;
        const condition = {
            type: conditionType
        };
        
        if (conditionType === 'comparison') {
            condition.operator = this.conditionOperatorSelect.value;
            condition.value = parseInt(this.conditionValueInput.value) || 0;
        }
        
        // Operation
        const fieldId = this.actionFieldSelect.value;
        if (!fieldId) {
            this.showToast('Please select a field to update', 'error');
            return;
        }
        
        const fieldName = this.actionFieldSelect.selectedOptions[0].dataset.fieldName;
        const operator = this.actionOperatorSelect.value;
        const valueSource = document.querySelector('input[name="valueSource"]:checked').value;
        
        const operation = {
            type: 'updateField',
            fieldId,
            fieldName,
            operator,
            valueSource
        };
        
        if (valueSource === 'fixed') {
            operation.fixedValue = parseFloat(this.actionFixedValueInput.value) || 0;
        }
        
        const minValue = this.actionMinValueInput.value.trim();
        const maxValue = this.actionMaxValueInput.value.trim();
        if (minValue) operation.minValue = parseFloat(minValue);
        if (maxValue) operation.maxValue = parseFloat(maxValue);
        
        // Save
        const actionData = {
            name,
            targetTypeId,
            targetTypeName,
            targetInstanceId,
            targetInstanceName,
            condition,
            operation,
            active: true,
            priority: this.diceActions.length,
            createdAt: Date.now()
        };
        
        try {
            await db.ref(`users/${this.currentUser.id}/diceActions`).push(actionData);
            this.showToast('Action created and activated!', 'success');
            soundManager.play('accepted');
            this.closeDiceActionBuilder();
            this.switchDiceTab('actions');
        } catch (err) {
            console.error('Failed to save action:', err);
            this.showToast('Failed to create action', 'error');
        }
    }

    async executeDiceActions(rollValue, sides) {
        if (this.diceActions.length === 0) return;
        
        // Get active actions sorted by priority
        const activeActions = this.diceActions
            .filter(a => a.active)
            .sort((a, b) => (a.priority || 999) - (b.priority || 999));
        
        for (const action of activeActions) {
            // Check condition
            let shouldExecute = false;
            
            if (action.condition.type === 'always') {
                shouldExecute = true;
            } else if (action.condition.type === 'comparison') {
                const op = action.condition.operator;
                const val = action.condition.value;
                
                if (op === '<') shouldExecute = rollValue < val;
                else if (op === '<=') shouldExecute = rollValue <= val;
                else if (op === '==') shouldExecute = rollValue === val;
                else if (op === '>=') shouldExecute = rollValue >= val;
                else if (op === '>') shouldExecute = rollValue > val;
            }
            
            if (!shouldExecute) continue;
            
            // Execute action
            try {
                await this.executeAction(action, rollValue);
            } catch (err) {
                console.error('Failed to execute action:', err);
            }
        }
    }

    async executeAction(action, rollValue) {
        // Get current field value
        const instanceRef = db.ref(`objects/${action.targetInstanceId}`);
        const snap = await instanceRef.once('value');
        
        if (!snap.exists()) {
            this.showToast(`Target instance not found: ${action.targetInstanceName}`, 'error');
            return;
        }
        
        const instance = snap.val();
        const currentValue = instance.data?.[action.operation.fieldId] || 0;
        
        // Calculate new value
        let newValue;
        const operand = action.operation.valueSource === 'roll' ? rollValue : action.operation.fixedValue;
        
        switch (action.operation.operator) {
            case 'set':
                newValue = operand;
                break;
            case 'add':
                newValue = currentValue + operand;
                break;
            case 'subtract':
                newValue = currentValue - operand;
                break;
            case 'multiply':
                newValue = currentValue * operand;
                break;
            case 'divide':
                newValue = operand !== 0 ? currentValue / operand : currentValue;
                break;
            default:
                newValue = currentValue;
        }
        
        // Apply constraints
        if (action.operation.minValue !== undefined) {
            newValue = Math.max(newValue, action.operation.minValue);
        }
        if (action.operation.maxValue !== undefined) {
            newValue = Math.min(newValue, action.operation.maxValue);
        }
        
        // Update field
        await instanceRef.child(`data/${action.operation.fieldId}`).set(newValue);
        
        // Show feedback
        const change = newValue - currentValue;
        const changeStr = change >= 0 ? `+${change}` : change;
        this.showToast(
            `${action.name}: ${action.targetInstanceName}'s ${action.operation.fieldName} ${currentValue} -> ${newValue} (${changeStr})`,
            'success'
        );
    }

    // ===== COLLABORATIVE STORY METHODS =====

    showCollabDocView() {
        this.authView.classList.add("hidden");
        this.homeView.classList.add("hidden");
        this.editorView.classList.add("hidden");
        this.profileView.classList.add("hidden");
        this.objectTypeBuilderView.classList.add("hidden");
        this.objectInstancesView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
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
        this.objectInstancesView.classList.add("hidden");
        this.objectInstanceEditorView.classList.add("hidden");
        this.dataVisualizationView.classList.add("hidden");
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
