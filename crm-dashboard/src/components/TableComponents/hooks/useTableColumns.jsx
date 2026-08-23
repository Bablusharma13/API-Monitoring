import { useMemo } from "react";
import { GripVertical } from "lucide-react";
import IndeterminateCheckbox from "../IndeterminateCheckbox";
import ActionDropdown from "../ActionDropdown";

export const useTableColumns = ({
  columns,
  selectedColumns,
  columnOrder,
  isAction,
  actions,
  isDNDenable,
  handleRestore,
  isTrash = false, 

  userId,
}) => {
  return useMemo(() => {
    const orderedColumns = [];

    if (isDNDenable) {
      orderedColumns.push({
        id: "dragHandle",
        Header: () => <></>,
        Cell: () => (
          <div className="flex items-center justify-center  h-full">
            <GripVertical className=" text-gray-400 hover:text-gray-600" />
          </div>
        ),
        disableSortBy: true,
        // width: 40,
        // minWidth: 40,
        // maxWidth: 40,
        isResize: false,
      });
    }

    // Get selection column if it exists (should always be included)
    const selectionColumn = columns.find((col) => col.id === "selection");

    const allDataColumns = columns.filter(
      (col) => col.id !== "actions" && col.id !== "dragHandle",
    );

    if (
      selectedColumns &&
      Array.isArray(selectedColumns) &&
      selectedColumns.length > 0
    ) {
      const selectedAccessors = selectedColumns
        .map((col) => col.accessor)
        .filter(Boolean);

      const filteredColumns = allDataColumns
        .filter((col) => {
          const colAccessor = col.accessor || col.id;
          // Always include selection column, even if not in selectedColumns
          return (
            col.id === "selection" || selectedAccessors.includes(colAccessor)
          );
        })
        .map((col) => {
          // If it's selection column, use original definition
          if (col.id === "selection") {
            return col;
          }
          const selectedCol = selectedColumns.find(
            (selCol) => selCol.accessor === (col.accessor || col.id),
          );
          return {
            ...col,
            // Preserve disableSortBy from original column definition
            // If not explicitly set, default to false (sortable)
            disableSortBy:
              col.disableSortBy !== undefined ? col.disableSortBy : false,
            // Apply sticky properties from selectedColumns if they exist (user's choice takes precedence)
            // Otherwise, use original column definition
            sticky:
              selectedCol?.sticky !== undefined
                ? selectedCol.sticky
                : (col.sticky ?? false),
            position: selectedCol?.position || col.position,
            stickyOrder:
              selectedCol?.stickyOrder !== undefined
                ? selectedCol.stickyOrder
                : col.stickyOrder,
          };
        });

      const orderedFilteredColumns = columnOrder
        .map((orderId) =>
          filteredColumns.find((col) => (col.accessor || col.id) === orderId),
        )
        .filter(Boolean);

      orderedColumns.push(...orderedFilteredColumns);
    } else {
      const orderedRegularColumns = columnOrder
        .map((orderId) =>
          allDataColumns.find((col) => (col.accessor || col.id) === orderId),
        )
        .filter(Boolean)
        .map((col) => ({
          ...col,
          // Preserve disableSortBy from original column definition
          // If not explicitly set, default to false (sortable)
          disableSortBy:
            col.disableSortBy !== undefined ? col.disableSortBy : false,
          // Preserve sticky, position, and stickyOrder properties from original column definition
          sticky: col.sticky,
          position: col.position,
          stickyOrder: col.stickyOrder,
        }));

      orderedColumns.push(...orderedRegularColumns);
    }

    // Always include selection column if it exists and is not already in orderedColumns
    if (selectionColumn) {
      const selectionExists = orderedColumns.some(
        (col) => col.id === "selection",
      );
      if (!selectionExists) {
        // Check if "selection" is in columnOrder to determine position
        const selectionOrderIndex = columnOrder.indexOf("selection");
        if (selectionOrderIndex >= 0) {
          // Insert at the position specified in columnOrder
          const insertIndex = Math.min(
            selectionOrderIndex,
            orderedColumns.length,
          );
          orderedColumns.splice(insertIndex, 0, selectionColumn);
        } else {
          // Insert selection at the beginning (after dragHandle if present)
          const dragHandleIndex = orderedColumns.findIndex(
            (col) => col.id === "dragHandle",
          );
          if (dragHandleIndex >= 0) {
            orderedColumns.splice(dragHandleIndex + 1, 0, selectionColumn);
          } else {
            orderedColumns.unshift(selectionColumn);
          }
        }
      }
    }

    // Sort left-sticky columns by stickyOrder while maintaining their relative positions
    const leftStickyIndices = [];
    orderedColumns.forEach((col, index) => {
      if (col.sticky && col.position === "left") {
        leftStickyIndices.push({ index, column: col });
      }
    });

    // If we have multiple left-sticky columns, sort them by stickyOrder
    if (leftStickyIndices.length > 1) {
      const sortedLeftSticky = [...leftStickyIndices].sort((a, b) => {
        const orderA = a.column.stickyOrder ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.column.stickyOrder ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // If orders are equal, maintain original array order
        return a.index - b.index;
      });

      // Replace left-sticky columns in their original positions with sorted order
      sortedLeftSticky.forEach((sortedItem, sortedIndex) => {
        const originalIndex = leftStickyIndices[sortedIndex].index;
        orderedColumns[originalIndex] = sortedItem.column;
      });
    }

    // Sort right-sticky columns by stickyOrder while maintaining their relative positions
    // For right sticky: lower order = rightmost, so we need to place them at the end
    const rightStickyIndices = [];
    orderedColumns.forEach((col, index) => {
      if (col.sticky && col.position === "right") {
        rightStickyIndices.push({ index, column: col });
      }
    });

    // If we have multiple right-sticky columns, sort them by stickyOrder
    if (rightStickyIndices.length > 1) {
      const sortedRightSticky = [...rightStickyIndices].sort((a, b) => {
        const orderA = a.column.stickyOrder ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.column.stickyOrder ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) {
          return orderA - orderB; // Lower order = rightmost
        }
        // If orders are equal, maintain original array order
        return a.index - b.index;
      });

      // Replace right-sticky columns in their original positions with sorted order
      sortedRightSticky.forEach((sortedItem, sortedIndex) => {
        const originalIndex = rightStickyIndices[sortedIndex].index;
        orderedColumns[originalIndex] = sortedItem.column;
      });
    }

    const result = orderedColumns;

    if (isAction) {
      result.push({
        id: "actions",
        Header: "Actions",
        disableSortBy: true,
        sticky: true,
        position: "right",
        headerStyle: { textAlign: "center" },
        headerClassName: "text-center",
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        Cell: ({ row }) => {
          const isBeforeEndTime = true;
          const status = row?.original?.status;
          return isBeforeEndTime && status !== "cancelled" ? (
            <ActionDropdown
              row={row}
              actions={actions}
              tableColumns={columns}
              handleRestore={handleRestore}
              isTrash={isTrash}
            />
          ) : (
            <div className="relative text-center flex items-center justify-center">
              <span className="text-sm text-gray-500">No action</span>
            </div>
          );
        },
      });
    }

    return result.filter(Boolean);
  }, [
    columns,
    actions,
    selectedColumns,
    isAction,
    columnOrder,
    isDNDenable,
    userId,
  ]);
};
