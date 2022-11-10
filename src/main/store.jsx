import { configureStore } from '@reduxjs/toolkit'

const state0 = {counter: 0};

function reducer(state = state0, action) {
    if(action.type === 1) {
        console.log("Action Type 1, message = " + action.message);
        return {...state, counter: 1};
    }
    return state;
}

const store = configureStore({
    reducer: reducer
});

export default store;

