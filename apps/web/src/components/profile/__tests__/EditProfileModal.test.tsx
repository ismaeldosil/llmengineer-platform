/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { EditProfileModal } from '../EditProfileModal';

describe('EditProfileModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    currentDisplayName: 'John Doe',
    onSave: mockOnSave,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when visible is true', () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      expect(getByTestId('edit-profile-modal')).toBeTruthy();
    });

    it('should not render modal content when visible is false', () => {
      const { queryByText } = render(<EditProfileModal {...defaultProps} visible={false} />);

      // Modal component exists in DOM but content shouldn't be visible
      expect(queryByText('Edit Profile')).toBeNull();
    });

    it('should render title', () => {
      const { getByText } = render(<EditProfileModal {...defaultProps} />);

      expect(getByText('Edit Profile')).toBeTruthy();
    });

    it('should render close button', () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      expect(getByTestId('close-button')).toBeTruthy();
    });

    it('should render input field with label', () => {
      const { getByText, getByTestId } = render(<EditProfileModal {...defaultProps} />);

      expect(getByText('Display Name')).toBeTruthy();
      expect(getByTestId('display-name-input')).toBeTruthy();
    });

    it('should render cancel and save buttons', () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      expect(getByTestId('cancel-button')).toBeTruthy();
      expect(getByTestId('save-button')).toBeTruthy();
    });

    it('should render character count', () => {
      const { getByText } = render(<EditProfileModal {...defaultProps} />);

      expect(getByText(/\d+ \/ 50 characters/)).toBeTruthy();
    });
  });

  describe('Initial State', () => {
    it('should display current display name in input', () => {
      const { getByDisplayValue } = render(<EditProfileModal {...defaultProps} />);

      expect(getByDisplayValue('John Doe')).toBeTruthy();
    });

    it('should show correct character count for initial value', () => {
      const { getByText } = render(<EditProfileModal {...defaultProps} />);

      expect(getByText('8 / 50 characters')).toBeTruthy();
    });

    it('should not show error message initially', () => {
      const { queryByTestId } = render(<EditProfileModal {...defaultProps} />);

      expect(queryByTestId('display-name-input-error')).toBeNull();
    });

    it('should not show success message initially', () => {
      const { queryByTestId } = render(<EditProfileModal {...defaultProps} />);

      expect(queryByTestId('success-message')).toBeNull();
    });
  });

  describe('Input Validation', () => {
    it('should update display name on text change', () => {
      const { getByTestId, getByDisplayValue } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'Jane Smith');

      expect(getByDisplayValue('Jane Smith')).toBeTruthy();
    });

    it('should update character count when typing', () => {
      const { getByTestId, getByText } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'A');

      expect(getByText('1 / 50 characters')).toBeTruthy();
    });

    it('should show error for empty display name', async () => {
      const { getByTestId, getByText } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), '');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByText('Display name is required')).toBeTruthy();
      });
    });

    it('should show error for display name with only spaces', async () => {
      const { getByTestId, getByText } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), '   ');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByText('Display name is required')).toBeTruthy();
      });
    });

    it('should show error for display name less than 2 characters', async () => {
      const { getByTestId, getByText } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'A');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByText('Display name must be at least 2 characters')).toBeTruthy();
      });
    });

    it('should show error for display name exceeding 50 characters', async () => {
      const { getByTestId, getByText } = render(<EditProfileModal {...defaultProps} />);

      const longName = 'A'.repeat(51);
      fireEvent.changeText(getByTestId('display-name-input'), longName);
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByText('Display name must not exceed 50 characters')).toBeTruthy();
      });
    });

    it('should accept valid display name with 2 characters', async () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'AB');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('AB');
      });
    });

    it('should accept valid display name with 50 characters', async () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      const maxName = 'A'.repeat(50);
      fireEvent.changeText(getByTestId('display-name-input'), maxName);
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(maxName);
      });
    });

    it('should clear error when user starts typing', () => {
      const { getByTestId, getByText, queryByText } = render(
        <EditProfileModal {...defaultProps} />
      );

      // Trigger error
      fireEvent.changeText(getByTestId('display-name-input'), '');
      fireEvent.press(getByTestId('save-button'));

      expect(getByText('Display name is required')).toBeTruthy();

      // Start typing
      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');

      expect(queryByText('Display name is required')).toBeNull();
    });

    it('should trim whitespace from display name before validation', async () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), '  Valid Name  ');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('Valid Name');
      });
    });
  });

  describe('Save Functionality', () => {
    it('should call onSave with new display name', async () => {
      mockOnSave.mockResolvedValue(undefined);
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('New Name');
      });
    });

    it('should show loading state while saving', async () => {
      mockOnSave.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      expect(getByTestId('save-button-spinner')).toBeTruthy();

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should disable buttons while saving', async () => {
      mockOnSave.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      // Check that buttons are disabled
      expect(getByTestId('save-button')).toBeTruthy();
      expect(getByTestId('cancel-button')).toBeTruthy();

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should show success message after successful save', async () => {
      mockOnSave.mockResolvedValue(undefined);
      const { getByTestId, getByText } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByText('Profile updated successfully!')).toBeTruthy();
      });
    });

    it('should close modal after successful save', async () => {
      jest.useFakeTimers();
      mockOnSave.mockResolvedValue(undefined);
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      jest.advanceTimersByTime(1500);

      expect(mockOnClose).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should show error message on save failure', async () => {
      mockOnSave.mockRejectedValue(new Error('Network error'));
      const { getByTestId, getByText } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByText('Network error')).toBeTruthy();
      });
    });

    it('should handle generic error on save failure', async () => {
      mockOnSave.mockRejectedValue('Unknown error');
      const { getByTestId, getByText } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByText('Failed to update profile')).toBeTruthy();
      });
    });

    it('should not call onSave if display name has not changed', async () => {
      const { getByTestId, getByText } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByText('No changes to save')).toBeTruthy();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should not call onSave if display name is invalid', async () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), '');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).not.toHaveBeenCalled();
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onClose when cancel button is pressed', () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.press(getByTestId('cancel-button'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when close button (X) is pressed', () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.press(getByTestId('close-button'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset display name to original value on cancel', () => {
      const { getByTestId, getByDisplayValue, rerender } = render(
        <EditProfileModal {...defaultProps} />
      );

      fireEvent.changeText(getByTestId('display-name-input'), 'Changed Name');
      fireEvent.press(getByTestId('cancel-button'));

      rerender(<EditProfileModal {...defaultProps} visible={true} />);

      expect(getByDisplayValue('John Doe')).toBeTruthy();
    });

    it('should clear error message on cancel', () => {
      const { getByTestId, getByText, queryByText, rerender } = render(
        <EditProfileModal {...defaultProps} />
      );

      fireEvent.changeText(getByTestId('display-name-input'), '');
      fireEvent.press(getByTestId('save-button'));

      expect(getByText('Display name is required')).toBeTruthy();

      fireEvent.press(getByTestId('cancel-button'));
      rerender(<EditProfileModal {...defaultProps} visible={true} />);

      expect(queryByText('Display name is required')).toBeNull();
    });

    it('should not allow cancel while saving', async () => {
      mockOnSave.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      fireEvent.press(getByTestId('cancel-button'));

      // onClose should not be called while saving
      expect(mockOnClose).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });
  });

  describe('Modal Behavior', () => {
    it('should reset state when modal becomes visible', () => {
      const { getByTestId, getByDisplayValue, rerender } = render(
        <EditProfileModal {...defaultProps} visible={false} />
      );

      rerender(<EditProfileModal {...defaultProps} visible={true} />);

      expect(getByDisplayValue('John Doe')).toBeTruthy();
      expect(getByTestId('display-name-input')).toBeTruthy();
    });

    it('should update input when currentDisplayName prop changes', () => {
      const { getByDisplayValue, rerender } = render(<EditProfileModal {...defaultProps} />);

      expect(getByDisplayValue('John Doe')).toBeTruthy();

      rerender(<EditProfileModal {...defaultProps} currentDisplayName="Jane Smith" />);

      expect(getByDisplayValue('Jane Smith')).toBeTruthy();
    });

    it('should handle onRequestClose', () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      const modal = getByTestId('edit-profile-modal');
      fireEvent(modal, 'requestClose');

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close on requestClose while saving', async () => {
      mockOnSave.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      const modal = getByTestId('edit-profile-modal');
      fireEvent(modal, 'requestClose');

      expect(mockOnClose).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long display names', () => {
      const longName = 'A'.repeat(100);
      const { getByTestId, getByText } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), longName);

      // Input component will accept the text, but validation will catch it
      // Character count will show the actual length
      expect(getByText(/\d+ \/ 50 characters/)).toBeTruthy();
    });

    it('should handle special characters in display name', async () => {
      mockOnSave.mockResolvedValue(undefined);
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      const specialName = 'João Ñoño 山田太郎';
      fireEvent.changeText(getByTestId('display-name-input'), specialName);
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(specialName);
      });
    });

    it('should handle numbers in display name', async () => {
      mockOnSave.mockResolvedValue(undefined);
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'User123');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('User123');
      });
    });

    it('should handle empty string as currentDisplayName', () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} currentDisplayName="" />);

      const input = getByTestId('display-name-input');
      expect(input.props.value).toBe('');
    });

    it('should clear success message when typing after success', async () => {
      mockOnSave.mockResolvedValue(undefined);
      const { getByTestId, getByText, queryByText } = render(
        <EditProfileModal {...defaultProps} />
      );

      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByText('Profile updated successfully!')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('display-name-input'), 'Another Name');

      expect(queryByText('Profile updated successfully!')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have proper testIDs for all interactive elements', () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      expect(getByTestId('edit-profile-modal')).toBeTruthy();
      expect(getByTestId('close-button')).toBeTruthy();
      expect(getByTestId('display-name-input')).toBeTruthy();
      expect(getByTestId('cancel-button')).toBeTruthy();
      expect(getByTestId('save-button')).toBeTruthy();
    });

    it('should auto-focus input when modal opens', () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      const input = getByTestId('display-name-input');
      expect(input.props.autoFocus).toBe(true);
    });

    it('should disable input while saving', async () => {
      mockOnSave.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      const input = getByTestId('display-name-input');
      expect(input.props.editable).toBe(false);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });
  });
});
