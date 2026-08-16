import { createContext, useReducer, useEffect } from 'react';
import api from '../api/axios';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'AUTH_READY':
      return { ...state, loading: false };
    default:
      return state;
  }
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then((response) => {
          dispatch({
            type: 'LOGIN',
            payload: { token, user: response.data.user },
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_READY' });
        });
    } else {
      dispatch({ type: 'AUTH_READY' });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;