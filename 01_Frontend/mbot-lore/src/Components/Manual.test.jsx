//Unit Tests for Manuel fahren

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ControlPanel from './Manual';
import { sendCommand } from '../API_Service/service';

jest.mock('../API_Service/service');

describe('ControlPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders ControlPanel and displays initial elements', () => {
    render(<ControlPanel />);

    expect(screen.getByText('Drive')).toBeInTheDocument();
    expect(screen.getByLabelText('LED')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  test('toggles LED on and off', () => {
    render(<ControlPanel />);

    const toggleSwitch = screen.getByText('LED').nextSibling;
    fireEvent.click(toggleSwitch);
    expect(toggleSwitch).toHaveClass('on');

    fireEvent.click(toggleSwitch);
    expect(toggleSwitch).toHaveClass('off');
  });

  test('opens and closes color picker', () => {
    render(<ControlPanel />);

    const colorPickerToggle = screen.getByText('LED').nextSibling.nextSibling.firstChild;
    fireEvent.click(colorPickerToggle);
    expect(screen.getByText('Set Color')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Set Color'));
    expect(screen.queryByText('Set Color')).not.toBeInTheDocument();
  });

  test('sets LED color', async () => {
    render(<ControlPanel />);

    const colorPickerToggle = screen.getByText('LED').nextSibling.nextSibling.firstChild;
    fireEvent.click(colorPickerToggle);

    const colorPicker = screen.getByText('Set Color').previousSibling;
    fireEvent.change(colorPicker, { target: { value: '#ff0000' } });
    fireEvent.click(screen.getByText('Set Color'));

    await waitFor(() => expect(sendCommand).toHaveBeenCalledWith('color', '255,0,0'));
  });

  test('changes speed value', async () => {
    render(<ControlPanel />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });

    await waitFor(() => expect(sendCommand).toHaveBeenCalledWith('speed', '75'));
  });

  test('handles key down and key up events', async () => {
    render(<ControlPanel />);

    fireEvent.keyDown(window, { key: 'ArrowUp' });
    await waitFor(() => expect(sendCommand).toHaveBeenCalledWith('drive', 'forward'));

    fireEvent.keyUp(window, { key: 'ArrowUp' });
    await waitFor(() => expect(sendCommand).toHaveBeenCalledWith('drive', 'stop'));
  });

  test('starts and stops driving', async () => {
    render(<ControlPanel />);

    const startStopButton = screen.getByText('Drive');
    fireEvent.click(startStopButton);
    expect(startStopButton).toHaveTextContent('Stop');

    fireEvent.click(startStopButton);
    expect(startStopButton).toHaveTextContent('Drive');
  });
});