import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import authReducer from '../store/authSlice';
import characterReducer from '../store/characterSlice';

const testStore = configureStore({
  reducer: {
    auth: authReducer,
    character: characterReducer,
  },
});

const renderWithProviders = (ui) => {
  return render(
    <Provider store={testStore}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
};

describe('Login', () => {
  it('should render login form', () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('should have register link', () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
  });
});

describe('Register', () => {
  it('should render register form', () => {
    renderWithProviders(<Register />);
    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('should have login link', () => {
    renderWithProviders(<Register />);
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
  });
});