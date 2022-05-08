import { LOGIN_USER, UPDATE_USER_PROOF, LOGOUT_USER, CHANGE_SERVICE, ADD_SERVICE, DELETE_SERVICE, SET_SERVICES, SHOW_MESSAGE, FILTER_SERVICES, SORT_SERVICES } from '../constants/action-types'


const initState = {
  user: {
    username: '',
    password: '',
    mail: '',
    salt: '',
    isAuthenticated: false,
    clientSessionProof: '',
    isOfflineMode: false,
  },
  services: [],
  displayedServices: [],
  messages: {}
}

function rootReducer(state = initState, action) {
  let user = {};
  let services = [];
  let displayedServices = [];
  let messages = {};

  switch (action.type) {
    case LOGIN_USER:
      user = action.payload
      services = [...state.services];
      displayedServices = [...state.services];
      messages = { ...state.messages };
      return {
        user,
        services,
        displayedServices,
        messages
      }

    case UPDATE_USER_PROOF:
      return Object.assign({}, state, {
        user: {
          ...state.user,
          clientSessionProof: action.payload
        }
      });

    case LOGOUT_USER:
      return { ...initState }

    case ADD_SERVICE:
      return Object.assign({}, state, {
        services: state.services.concat(action.payload),
        displayedServices: state.displayedServices.concat(action.payload)
      });

    case CHANGE_SERVICE:
      user = { ...state.user };
      services = [...state.services];
      displayedServices = [...state.displayedServices];
      messages = { ...state.messages };

      let serviceIndex = services.findIndex((service) => {
        return service.id === action.payload.id
      })
      services[serviceIndex] = action.payload

      let displayedServiceIndex = displayedServices.findIndex((service) => {
        return service.id === action.payload.id
      })
      displayedServices[displayedServiceIndex] = action.payload

      return {
        user,
        services,
        displayedServices,
        messages
      }

    case DELETE_SERVICE:
      user = { ...state.user };
      displayedServices = [...state.displayedServices];
      messages = { ...state.messages };
      // find index of element that is to be removed
      const index = state.services.findIndex((service) => {
        return service.id === action.payload.id;
      });

      const indexDS = state.displayedServices.findIndex((service) => {
        return service.id === action.payload.id;
      });
      if (index >= 0) {
        // slice array in 2 parts: left and right of the element that is to be removed
        const leftArray = state.services.slice(0, index);
        const rightArray = state.services.slice(index + 1, state.services.length);
        const leftArrayDS = state.displayedServices.slice(0, indexDS);
        const rightArrayDS = state.displayedServices.slice(indexDS + 1, state.displayedServices.length);
        // concatenate left and right part again
        services = leftArray.concat(rightArray);
        displayedServices = leftArrayDS.concat(rightArrayDS);
        return {
          user,
          services,
          displayedServices,
          messages
        }
      }
      break;

    case SET_SERVICES:
      user = { ...state.user };
      services = action.payload;
      displayedServices = action.payload;
      messages = { ...state.messages };

      return {
        user,
        services,
        displayedServices,
        messages
      };

    case FILTER_SERVICES:
      console.log(action.payload)
      user = { ...state.user };
      services = [...state.services];
      displayedServices = action.payload;
      messages = { ...state.messages };

      return {
        user,
        services,
        displayedServices,
        messages
      }

    case SORT_SERVICES:
      user = { ...state.user };
      services = [...state.services];
      displayedServices = [...state.displayedServices];
      displayedServices.sort((a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) return 1
        if (a.name.toLowerCase() > b.name.toLowerCase()) return -1
        return 0
      })

      if (action.payload === 1) {
        displayedServices.reverse()
      }

      messages = { ...state.messages };

      return {
        user,
        services,
        displayedServices,
        messages
      }

    case SHOW_MESSAGE:
      user = { ...state.user };
      services = [...state.services];
      displayedServices = [...state.displayedServices]
      let message = {};
      message = action.payload;

      return { user, services, displayedServices, message };
    default:
      return state;
  }
  // return initial state
  return state;
}

export default rootReducer;