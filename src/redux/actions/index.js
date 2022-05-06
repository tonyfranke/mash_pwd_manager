import { LOGIN_USER, UPDATE_USER_PROOF, LOGOUT_USER, ADD_SERVICE, CHANGE_SERVICE, DELETE_SERVICE,
    SET_SERVICES, FILTER_SERVICES, SORT_SERVICES, SHOW_MESSAGE } from '../constants/action-types'

export function loginUser(payload) {
    return { type: LOGIN_USER, payload }
};

export function updateUserProof(payload) {
    return { type: UPDATE_USER_PROOF, payload }
};

export function logoutUser(payload) {
    return { type: LOGOUT_USER, payload }
};

export function addService(payload) {
    return { type: ADD_SERVICE, payload }
};

export function changeService(payload) {
    return { type: CHANGE_SERVICE, payload }
};

export function deleteService(payload) {
    return { type: DELETE_SERVICE, payload }
};

export function setServices(payload) {
    return { type: SET_SERVICES, payload }
};

export function filterServices(payload) {
    return { type: FILTER_SERVICES, payload }
};

export function showMessage(payload) {
    return { type: SHOW_MESSAGE, payload }
}

export function sortServices(payload) {
    return { type: SORT_SERVICES, payload }
}