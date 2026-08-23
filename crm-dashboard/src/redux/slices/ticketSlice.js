import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ticketList: [],
  loading: false,
  error: null,
  totalPages: 0,
  totalRecords: 0,
  currentPage: 1,
  searchTerm: "",
  selectedFilters: {},
  ticketStatStatus: "",
};

export const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    // Set ticket list
    setTicketList: (state, action) => {
      state.ticketList = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Set pagination data
    setPaginationData: (state, action) => {
      const { totalPages, totalRecords, currentPage } = action.payload;
      state.totalPages = totalPages;
      state.totalRecords = totalRecords;
      state.currentPage = currentPage;
    },
    
    // Set current page
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    
    // Set search term
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    
    // Set filters
    // setSelectedFilters: (state, action) => {
    //   state.selectedFilters = action.payload;
    // },
     setSelectedFilters: (state, action) => {
      // state.selectedFilters = action.payload;
      Object.entries(action.payload).forEach(([filterName, values]) => {
        if (!Array.isArray(values)) return;

        const prevValues = state.selectedFilters[filterName] || [];
        

        state.selectedFilters[filterName] = [
          ...new Set([...prevValues, ...values])
        ];
      });
    },
    removeSelectedFilters: (state) => {
      // state.selectedFilters = action.payload;
      state.selectedFilters = {}
    },
    
    // Set ticket stat status
    setTicketStatStatus: (state, action) => {
      state.ticketStatStatus = action.payload;
    },
    
    // Update ticket in list (for individual ticket updates)
    updateTicket: (state, action) => {
      const updatedTicket = action.payload;
      const index = state.ticketList.findIndex(
        (ticket) => 
          ticket.id === updatedTicket.id || 
          ticket._id === updatedTicket._id || 
          ticket.ticketId === updatedTicket.ticketId
      );
      if (index !== -1) {
        state.ticketList[index] = updatedTicket;
      }
    },
    
    // Remove ticket from list (for deletions)
    removeTicket: (state, action) => {
      const ticketId = action.payload;
      state.ticketList = state.ticketList.filter(
        (ticket) => 
          ticket.id !== ticketId && 
          ticket._id !== ticketId && 
          ticket.ticketId !== ticketId
      );
    },
    
    // Clear all filters and search
    clearAllFilters: (state) => {
      state.searchTerm = "";
      state.selectedFilters = {};
      state.ticketStatStatus = "";
      state.currentPage = 1;
    },
    
    // Reset state
    resetTicketState: (state) => {
      return initialState;
    }
  },
});

export const { 
  setTicketList,
  setLoading,
  setError,
  setPaginationData,
  setCurrentPage,
  setSearchTerm,
  setSelectedFilters,
  setTicketStatStatus,
  updateTicket,
  removeTicket,
  clearAllFilters,
  resetTicketState,
  removeSelectedFilters
} = ticketSlice.actions;

// Selectors
export const selectTicketList = (state) => state.ticket.ticketList;
export const selectLoading = (state) => state.ticket.loading;
export const selectError = (state) => state.ticket.error;
export const selectTotalPages = (state) => state.ticket.totalPages;
export const selectTotalRecords = (state) => state.ticket.totalRecords;
export const selectCurrentPage = (state) => state.ticket.currentPage;
export const selectSearchTerm = (state) => state.ticket.searchTerm;
export const selectSelectedFilters = (state) => state.ticket.selectedFilters;
export const selectTicketStatStatus = (state) => state.ticket.ticketStatStatus;

export default ticketSlice.reducer;