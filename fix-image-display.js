// Fix Image Display - Complete Solution
// This script will diagnose and fix image display issues

window.API_BASE = 'http://localhost:5001';

function testImageDisplay() {
    console.log('=== Testing Image Display ===');
    
    // Test 1: Direct image access
    const testImages = [
        '1775204357232-909725816-Screenshot 2026-04-03 130133.png',
        '1775204783321-108096103-Screenshot 2026-04-03 130123.png'
    ];
    
    testImages.forEach(imageName => {
        const img = new Image();
        img.onload = () => console.log(`SUCCESS: ${imageName} loaded`);
        img.onerror = () => console.log(`FAILED: ${imageName} failed to load`);
        img.src = `${window.API_BASE}/uploads/${imageName}`;
    });
    
    // Test 2: Backend connectivity
    fetch(`${window.API_BASE}/api/health`)
        .then(r => r.json())
        .then(data => console.log('Backend health:', data))
        .catch(e => console.error('Backend connection failed:', e));
}

// Fix the student.js image display function
function fixImageDisplay() {
    console.log('Applying image display fix...');
    
    // Override the viewComplaint function with fixed image display
    if (typeof viewComplaint !== 'undefined') {
        const originalViewComplaint = viewComplaint;
        window.viewComplaint = function(c) {
            document.getElementById('viewModalBody').innerHTML = `
                <div style="display:grid;gap:1rem;">
                    <div><strong>Title:</strong> ${escHtml(c.title)}</div>
                    <div><strong>Category:</strong> ${catBadge(c.category)}</div>
                    <div><strong>Status:</strong> ${statusBadge(c.status)}</div>
                    <div><strong>Priority:</strong> ${priorityBadge(c.priority)}</div>
                    <div><strong>Description:</strong><br/><p style="color:var(--text-secondary);margin-top:0.25rem;">${escHtml(c.description)}</p></div>
                    ${c.admin_remark ? `<div style="background:rgba(99,102,241,0.08);border-radius:8px;padding:0.75rem;"><strong>Admin Remark:</strong><br/><p style="color:var(--text-secondary);margin-top:0.25rem;">${escHtml(c.admin_remark)}</p></div>` : ''}
                    ${c.image_url ? `
                        <div>
                            <strong>Attached Image:</strong><br/>
                            <div style="margin-top:0.5rem;">
                                <img src="${window.API_BASE}${c.image_url}" 
                                     class="complaint-image" 
                                     style="max-width:100%;max-height:300px;border-radius:8px;border:1px solid #ddd;object-fit:cover;"
                                     alt="Complaint image"
                                     onload="console.log('Image loaded successfully:', this.src)"
                                     onerror="console.error('Image failed to load:', this.src); this.style.display='none'; this.nextElementSibling.style.display='block';">
                                <div style="display:none;color:#ef4444;font-size:0.8rem;padding:10px;background:#fef2f2;border-radius:4px;margin-top:0.5rem;">
                                    <strong>Image not available</strong><br>
                                    <small>URL: ${window.API_BASE}${c.image_url}</small><br>
                                    <button onclick="window.open('${window.API_BASE}${c.image_url}', '_blank')" style="margin-top:5px;padding:4px 8px;font-size:0.7rem;">Open in New Tab</button>
                                </div>
                            </div>
                        </div>
                    ` : '<div><strong>No image attached</strong></div>'}
                    <div style="color:var(--text-muted);font-size:0.8rem;">Submitted: ${formatDate(c.created_at)}</div>
                </div>
            `;
            openModal('viewModal');
        };
        console.log('Image display fix applied');
    } else {
        console.error('viewComplaint function not found');
    }
}

// Auto-fix when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            testImageDisplay();
            fixImageDisplay();
        }, 1000);
    });
} else {
    setTimeout(() => {
        testImageDisplay();
        fixImageDisplay();
    }, 1000);
}

// Export for manual testing
window.testImageDisplay = testImageDisplay;
window.fixImageDisplay = fixImageDisplay;
