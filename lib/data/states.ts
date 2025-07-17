import statesAndLGAs from './nigeria-state-and-lgas.json';

// Export the states data for use in dropdowns
export const states = statesAndLGAs.map(state => ({
  state: state.state,
  alias: state.alias
}));

// Function to get LGAs for a specific state
export const getLGAsForState = (stateName: string): string[] => {
  const stateData = statesAndLGAs.find(state => state.state === stateName);
  return stateData ? stateData.lgas : [];
};

// Home ownership options
export const homeOwnershipOptions: Record<string, string> = {
  "owned": "Owned",
  "rented": "Rented",
  "family_house": "Family House",
  "other": "Other"
};