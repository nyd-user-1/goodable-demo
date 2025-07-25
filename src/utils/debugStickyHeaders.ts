// Debugging utility for sticky table headers
export function debugStickyHeaders() {
  console.log('=== Sticky Header Debug ===');
  
  // Find all table headers
  const tableHeaders = document.querySelectorAll('thead');
  
  tableHeaders.forEach((header, index) => {
    const computedStyle = window.getComputedStyle(header);
    const table = header.closest('table');
    const container = header.closest('.border.rounded-md.overflow-hidden.bg-card');
    
    console.log(`\nTable ${index + 1}:`);
    console.log('Header position:', computedStyle.position);
    console.log('Header top:', computedStyle.top);
    console.log('Header z-index:', computedStyle.zIndex);
    console.log('Table classes:', table?.className);
    console.log('Container classes:', container?.className);
    
    // Check ScrollArea
    const scrollArea = header.closest('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      const scrollAreaStyle = window.getComputedStyle(scrollArea);
      console.log('ScrollArea position:', scrollAreaStyle.position);
      console.log('ScrollArea overflow:', scrollAreaStyle.overflow);
    }
    
    // Check first column cells
    const firstTh = header.querySelector('th:first-child');
    if (firstTh) {
      const firstThStyle = window.getComputedStyle(firstTh);
      console.log('First column header position:', firstThStyle.position);
      console.log('First column header left:', firstThStyle.left);
    }
  });
  
  console.log('\n=== End Debug ===');
}

// Add to window for easy access
if (typeof window !== 'undefined') {
  (window as any).debugStickyHeaders = debugStickyHeaders;
}