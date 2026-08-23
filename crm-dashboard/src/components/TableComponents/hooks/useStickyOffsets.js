import { useMemo } from "react";

const DEFAULT_COLUMN_WIDTH = 150;
const DEFAULT_SELECTION_WIDTH = 50;
const DEFAULT_ACTIONS_WIDTH = 120;

const getColumnWidthValue = (columnId, column, columnWidths) => {
  // First check if there's a persisted width in state
  if (columnWidths[columnId]) {
    return columnWidths[columnId];
  }
  // Then check localStorage
  const savedWidth = localStorage.getItem(`columnWidth_${columnId}`);
  if (savedWidth) {
    const parsedWidth = parseInt(savedWidth, 10);
    if (!isNaN(parsedWidth) && parsedWidth > 0) {
      return parsedWidth;
    }
  }
  // Use column's default width
  if (column && column.width) {
    return column.width;
  }
  // Fallback defaults
  if (columnId === "selection") {
    return DEFAULT_SELECTION_WIDTH;
  }
  if (columnId === "actions") {
    return DEFAULT_ACTIONS_WIDTH;
  }
  return DEFAULT_COLUMN_WIDTH;
};

export const useStickyOffsets = ({ memoizedColumns, columnWidths }) => {
  const leftStickyOffsets = useMemo(() => {
    const offsets = {};
    
    // Extract left sticky columns and sort by order
    const leftStickyColumns = memoizedColumns
      .filter((col) => col.sticky && col.position === "left")
      .map((col) => ({
        columnId: col.id || col.accessor,
        order: col.stickyOrder ?? Number.MAX_SAFE_INTEGER, // Default to last if no order specified
        originalIndex: memoizedColumns.findIndex(
          (c) => (c.id || c.accessor) === (col.id || col.accessor)
        ),
      }))
      .sort((a, b) => {
        // Sort by order first, then by original index if orders are equal
        if (a.order !== b.order) {
          return a.order - b.order; // Lower order = appears first
        }
        return a.originalIndex - b.originalIndex;
      });
    
    // Create a map of all column widths for quick lookup
    const columnWidthMap = {};
    memoizedColumns.forEach((column) => {
      const columnId = column.id || column.accessor;
      columnWidthMap[columnId] = getColumnWidthValue(columnId, column, columnWidths);
    });
    
    // Calculate offsets: for each sticky column in sorted order
    // The offset should position sticky columns in their sorted order, regardless of DOM order
    leftStickyColumns.forEach((stickyCol, sortedIndex) => {
      let offset = 0;
      
      // Sum widths of all non-sticky columns that appear before the leftmost sticky column in DOM
      const leftmostStickyIndex = Math.min(...leftStickyColumns.map((sc) => sc.originalIndex));
      memoizedColumns.forEach((column, colIndex) => {
        const columnId = column.id || column.accessor;
        const isSticky = column.sticky && column.position === "left";
        
        if (!isSticky && colIndex < leftmostStickyIndex) {
          offset += columnWidthMap[columnId];
        }
      });
      
      // Add widths of sticky columns that come before this one in sorted order
      for (let i = 0; i < sortedIndex; i++) {
        const prevStickyCol = leftStickyColumns[i];
        offset += columnWidthMap[prevStickyCol.columnId];
      }
      
      offsets[stickyCol.columnId] = offset;
    });
    
    return offsets;
  }, [memoizedColumns, columnWidths]);

  const rightStickyOffsets = useMemo(() => {
    const offsets = {};
    
    // Extract right sticky columns and sort by order
    // For right sticky: lower order = appears rightmost (closest to right edge)
    const rightStickyColumns = memoizedColumns
      .filter((col) => col.sticky && col.position === "right")
      .map((col) => ({
        columnId: col.id || col.accessor,
        order: col.stickyOrder ?? Number.MAX_SAFE_INTEGER, // Default to last if no order specified
        originalIndex: memoizedColumns.findIndex(
          (c) => (c.id || c.accessor) === (col.id || col.accessor)
        ),
      }))
      .sort((a, b) => {
        // Sort by order first, then by original index if orders are equal
        // Lower order = appears rightmost (so we sort ascending)
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return a.originalIndex - b.originalIndex;
      });
    
    // Create a map of all column widths for quick lookup
    const columnWidthMap = {};
    memoizedColumns.forEach((column) => {
      const columnId = column.id || column.accessor;
      columnWidthMap[columnId] = getColumnWidthValue(columnId, column, columnWidths);
    });
    
    // Calculate offsets: for each sticky column in sorted order
    // Right sticky columns: lower order = rightmost (offset 0), higher order = to the left (larger offset)
    rightStickyColumns.forEach((stickyCol, sortedIndex) => {
      let offset = 0;
      
      // Sum widths of all non-sticky columns that appear after the rightmost sticky column in DOM
      const rightmostStickyIndex = rightStickyColumns.length > 0
        ? Math.max(...rightStickyColumns.map((sc) => sc.originalIndex))
        : memoizedColumns.length - 1;
      
      for (let i = memoizedColumns.length - 1; i >= 0; i--) {
        const column = memoizedColumns[i];
        const columnId = column.id || column.accessor;
        const isSticky = column.sticky && column.position === "right";
        
        if (!isSticky && i > rightmostStickyIndex) {
          offset += columnWidthMap[columnId];
        }
      }
      
      // Add widths of sticky columns with LOWER order (that appear to the right of this one)
      // For right sticky: lower order = rightmost, so columns with lower order than this one
      // appear to the right and their widths should be added to the offset
      for (let i = 0; i < sortedIndex; i++) {
        const prevStickyCol = rightStickyColumns[i];
        offset += columnWidthMap[prevStickyCol.columnId];
      }
      
      offsets[stickyCol.columnId] = offset;
    });
    
    return offsets;
  }, [memoizedColumns, columnWidths]);

  // Return sorted arrays for z-index calculation
  const leftStickyOrder = useMemo(() => {
    return memoizedColumns
      .filter((col) => col.sticky && col.position === "left")
      .map((col) => ({
        columnId: col.id || col.accessor,
        order: col.stickyOrder ?? Number.MAX_SAFE_INTEGER,
        originalIndex: memoizedColumns.findIndex(
          (c) => (c.id || c.accessor) === (col.id || col.accessor)
        ),
      }))
      .sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return a.originalIndex - b.originalIndex;
      })
      .map((sc) => sc.columnId);
  }, [memoizedColumns]);

  const rightStickyOrder = useMemo(() => {
    return memoizedColumns
      .filter((col) => col.sticky && col.position === "right")
      .map((col) => ({
        columnId: col.id || col.accessor,
        order: col.stickyOrder ?? Number.MAX_SAFE_INTEGER,
        originalIndex: memoizedColumns.findIndex(
          (c) => (c.id || c.accessor) === (col.id || col.accessor)
        ),
      }))
      .sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return a.originalIndex - b.originalIndex;
      })
      .map((sc) => sc.columnId);
  }, [memoizedColumns]);

  return { leftStickyOffsets, rightStickyOffsets, leftStickyOrder, rightStickyOrder };
};







