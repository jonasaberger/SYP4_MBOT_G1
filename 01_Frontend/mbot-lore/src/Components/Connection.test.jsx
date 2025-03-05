//Unit Tests for ConnectionComponent	

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ConnectionComponent from './Connection';
import { sendCommand } from '../API_Service/service';

jest.mock('../API_Service/service');

describe('ConnectionComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders ConnectionComponent and displays initial elements', () => {
    render(<ConnectionComponent />);

    expect(screen.getByText('Connection')).toBeInTheDocument();
    expect(screen.getByLabelText('IP:')).toBeInTheDocument();
    expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
    expect(screen.getByText('Restore Session')).toBeInTheDocument();
  });

  test('displays error message for invalid IP address', async () => {
    render(<ConnectionComponent />);

    fireEvent.change(screen.getByLabelText('IP:'), { target: { value: 'invalid-ip' } });
    fireEvent.click(screen.getByText('Connect'));

    expect(await screen.findByText('Ungültige IP-Adresse!')).toBeInTheDocument();
  });

  test('sends command and saves session on successful connection', async () => {
    sendCommand.mockResolvedValue({ status: 'success' });

    render(<ConnectionComponent />);

    fireEvent.change(screen.getByLabelText('IP:'), { target: { value: '192.168.0.1' } });
    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'Test Session' } });
    fireEvent.click(screen.getByText('Connect'));

    await waitFor(() => expect(sendCommand).toHaveBeenCalledWith('ip-target', '192.168.0.1'));
    expect(await screen.findByText('Verbindung erfolgreich!')).toBeInTheDocument();
  });

  test('displays error message on failed connection', async () => {
    sendCommand.mockRejectedValue(new Error('Server hat die Verbindung nicht bestätigt!'));

    render(<ConnectionComponent />);

    fireEvent.change(screen.getByLabelText('IP:'), { target: { value: '192.168.0.1' } });
    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'Test Session' } });
    fireEvent.click(screen.getByText('Connect'));

    expect(await screen.findByText('Verbindung fehlgeschlagen: Server hat die Verbindung nicht bestätigt!')).toBeInTheDocument();
  });

  test('restores session on button click', async () => {
    const sessions = [{ ip: '192.168.0.1', name: 'Test Session' }];
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ sessions }),
      })
    );

    render(<ConnectionComponent />);

    fireEvent.click(screen.getByText('Restore Session'));
    fireEvent.click(screen.getByText('Test Session (192.168.0.1)'));

    await waitFor(() => expect(sendCommand).toHaveBeenCalledWith('ip-target', '192.168.0.1'));
    expect(await screen.findByText('Verbindung erfolgreich!')).toBeInTheDocument();
  });
});