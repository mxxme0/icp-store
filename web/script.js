class ICPStore {
    constructor() {
        this.files = [];
        this.filteredFiles = [];
        this.baseUrl = 'https://github.com/mxxme0/icp-store/releases/download/ICP/';
        this.tabletUrl = 'https://github.com/mxxme0/icp-store/releases/download/ICP-T/';
        this.apiUrl = 'https://api.github.com/repos/mxxme0/icp-store/releases/latest';
        
        this.searchInput = document.getElementById('searchInput');
        this.filesContainer = document.getElementById('filesContainer');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.loadFiles();
    }
    
    setupEventListeners() {
        this.searchInput.addEventListener('input', (e) => {
            this.filterFiles(e.target.value);
        });
    }
    
    async loadFiles() {
        try {
            this.showLoading();
            
            // Fetch mobile and tablet releases separately
            const [mobileResponse, tabletResponse] = await Promise.all([
                fetch('https://api.github.com/repos/mxxme0/icp-store/releases/tags/ICP'),
                fetch('https://api.github.com/repos/mxxme0/icp-store/releases/tags/ICP-T')
            ]);
            
            if (!mobileResponse.ok || !tabletResponse.ok) {
                throw new Error('Failed to fetch release data');
            }
            
            const [mobileRelease, tabletRelease] = await Promise.all([
                mobileResponse.json(),
                tabletResponse.json()
            ]);
            
            // Extract mobile files
            const mobileFiles = mobileRelease.assets
                .filter(asset => asset.name.endsWith('.icp'))
                .map(asset => ({
                    name: asset.name,
                    displayName: asset.name.replace('.icp', ''),
                    downloadUrl: asset.browser_download_url,
                    size: asset.size,
                    deviceType: 'mobile'
                }));
            
            // Extract tablet files
            const tabletFiles = tabletRelease.assets
                .filter(asset => asset.name.endsWith('.icp'))
                .map(asset => ({
                    name: asset.name,
                    displayName: asset.name.replace('.icp', ''),
                    downloadUrl: asset.browser_download_url,
                    size: asset.size,
                    deviceType: 'tablet'
                }));
            
            // Combine both arrays
            this.files = [...mobileFiles, ...tabletFiles];
            
            // Sort by device type (mobile first, then tablet)
            this.files.sort((a, b) => {
                if (a.deviceType === b.deviceType) {
                    return a.displayName.localeCompare(b.displayName);
                }
                return a.deviceType === 'mobile' ? -1 : 1;
            });
            
            this.filteredFiles = [...this.files];
            this.renderFiles();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading files:', error);
            this.showError();
        }
    }
    
    filterFiles(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredFiles = [...this.files];
        } else {
            this.filteredFiles = this.files.filter(file => 
                file.displayName.toLowerCase().includes(searchTerm) ||
                file.name.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderFiles();
    }
    
    renderFiles() {
        if (this.filteredFiles.length === 0) {
            this.filesContainer.innerHTML = `
                <div class="no-results">
                    <h3>No files found</h3>
                    <p>Try adjusting your search terms</p>
                </div>
            `;
            return;
        }
        
        this.filesContainer.innerHTML = this.filteredFiles
            .map(file => this.createFileElement(file))
            .join('');
    }
    
    createFileElement(file) {
        const deviceTag = file.deviceType === 'mobile' ? 'mobile' : 'tablet';
        const deviceClass = file.deviceType === 'mobile' ? 'device-mobile' : 'device-tablet';
        
        return `
            <div class="file-item" onclick="window.open('${file.downloadUrl}', '_blank')">
                <div class="file-info">
                    <div class="file-name">${file.displayName}</div>
                    <div class="file-meta">
                        <span class="file-extension">.icp file</span>
                        <span class="device-tag ${deviceClass}">${deviceTag}</span>
                    </div>
                </div>
                <button class="download-button" onclick="event.stopPropagation(); window.open('${file.downloadUrl}', '_blank')">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </button>
            </div>
        `;
    }
    
    showLoading() {
        this.loading.style.display = 'block';
        this.error.style.display = 'none';
        this.filesContainer.innerHTML = '';
    }
    
    hideLoading() {
        this.loading.style.display = 'none';
    }
    
    showError() {
        this.loading.style.display = 'none';
        this.error.style.display = 'block';
        this.filesContainer.innerHTML = '';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ICPStore();
});