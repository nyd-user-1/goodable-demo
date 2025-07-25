import { useEffect, useRef } from 'react';

export function useStickyTableHeader() {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tableRef.current) return;

    // Find the ScrollArea viewport and apply fixes
    const scrollAreaViewport = tableRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollAreaViewport) {
      scrollAreaViewport.classList.add('scroll-area-viewport-sticky-fix');
    }

    // Find the table element and add our custom class
    const table = tableRef.current.querySelector('table');
    if (table) {
      table.classList.add('table-with-sticky-header');
    }

    // Find sticky columns and add the class
    const firstColumnHeaders = tableRef.current.querySelectorAll('thead th:first-child');
    const firstColumnCells = tableRef.current.querySelectorAll('tbody td:first-child');
    
    firstColumnHeaders.forEach(th => th.classList.add('sticky-column'));
    firstColumnCells.forEach(td => td.classList.add('sticky-column'));

    // Add container classes based on table type
    const container = tableRef.current.closest('.space-y-4');
    if (container) {
      if (container.querySelector('input[placeholder*="bills"]')) {
        container.classList.add('bills-table-container');
      } else if (container.querySelector('input[placeholder*="members"]')) {
        container.classList.add('members-table-container');
      } else if (container.querySelector('input[placeholder*="committees"]')) {
        container.classList.add('committees-table-container');
      }
    }

    // Fix for nested ScrollArea issues
    const nestedScrollAreas = tableRef.current.querySelectorAll('[data-radix-scroll-area-viewport]');
    nestedScrollAreas.forEach(area => {
      const parent = area.parentElement;
      if (parent) {
        parent.classList.add('nested-scroll-fix');
      }
    });

    // Ensure proper height propagation
    const scrollWrapper = tableRef.current.querySelector('.overflow-hidden.bg-card');
    if (scrollWrapper) {
      scrollWrapper.classList.add('table-scroll-wrapper');
    }

    return () => {
      // Cleanup if needed
      if (scrollAreaViewport) {
        scrollAreaViewport.classList.remove('scroll-area-viewport-sticky-fix');
      }
      if (table) {
        table.classList.remove('table-with-sticky-header');
      }
    };
  }, []);

  return tableRef;
}