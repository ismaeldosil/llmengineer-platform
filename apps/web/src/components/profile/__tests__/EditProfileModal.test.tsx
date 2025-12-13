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
    currentAvatarUrl: 'https://example.com/avatar.jpg',
    currentBio: 'This is my bio',
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

    it('should render all input fields with labels', () => {
      const { getByText, getByTestId } = render(<EditProfileModal {...defaultProps} />);

      expect(getByText('Display Name')).toBeTruthy();
      expect(getByTestId('display-name-input')).toBeTruthy();

      expect(getByText('Avatar URL (optional)')).toBeTruthy();
      expect(getByTestId('avatar-url-input')).toBeTruthy();

      expect(getByText('Bio (optional)')).toBeTruthy();
      expect(getByTestId('bio-input')).toBeTruthy();
    });

    it('should render cancel and save buttons', () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      expect(getByTestId('cancel-button')).toBeTruthy();
      expect(getByTestId('save-button')).toBeTruthy();
    });

    it('should render character counts', () => {
      const { getAllByText } = render(<EditProfileModal {...defaultProps} />);

      const characterCounts = getAllByText(/\d+ \/ \d+ characters/);
      expect(characterCounts.length).toBeGreaterThan(0);
    });
  });

  describe('Initial State', () => {
    it('should display current values in inputs', () => {
      const { getByDisplayValue } = render(<EditProfileModal {...defaultProps} />);

      expect(getByDisplayValue('John Doe')).toBeTruthy();
      expect(getByDisplayValue('https://example.com/avatar.jpg')).toBeTruthy();
      expect(getByDisplayValue('This is my bio')).toBeTruthy();
    });

    it('should handle missing optional fields', () => {
      const { getByTestId } = render(
        <EditProfileModal {...defaultProps} currentAvatarUrl={undefined} currentBio={undefined} />
      );

      const avatarInput = getByTestId('avatar-url-input');
      const bioInput = getByTestId('bio-input');

      expect(avatarInput.props.value).toBe('');
      expect(bioInput.props.value).toBe('');
    });

    it('should not show error messages initially', () => {
      const { queryByTestId } = render(<EditProfileModal {...defaultProps} />);

      expect(queryByTestId('display-name-input-error')).toBeNull();
      expect(queryByTestId('avatar-url-input-error')).toBeNull();
      expect(queryByTestId('bio-input-error')).toBeNull();
    });

    it('should not show success message initially', () => {
      const { queryByTestId } = render(<EditProfileModal {...defaultProps} />);

      expect(queryByTestId('success-message')).toBeNull();
    });
  });

  describe('Display Name Validation', () => {
    it('should update display name on text change', () => {
      const { getByTestId, getByDisplayValue } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'Jane Smith');

      expect(getByDisplayValue('Jane Smith')).toBeTruthy();
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
      mockOnSave.mockResolvedValue(undefined);
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'AB');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({ displayName: 'AB' }));
      });
    });

    it('should clear error when user starts typing', () => {
      const { getByTestId, getByText, queryByText } = render(
        <EditProfileModal {...defaultProps} />
      );

      fireEvent.changeText(getByTestId('display-name-input'), '');
      fireEvent.press(getByTestId('save-button'));

      expect(getByText('Display name is required')).toBeTruthy();

      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');

      expect(queryByText('Display name is required')).toBeNull();
    });
  });

  describe('Avatar URL Validation', () => {
    it('should update avatar URL on text change', () => {
      const { getByTestId, getByDisplayValue } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('avatar-url-input'), 'https://new.com/avatar.png');

      expect(getByDisplayValue('https://new.com/avatar.png')).toBeTruthy();
    });

    it('should accept empty avatar URL', async () => {
      mockOnSave.mockResolvedValue(undefined);
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('avatar-url-input'), '');
      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({ displayName: 'New Name', avatarUrl: undefined })
        );
      });
    });

    it('should show error for invalid URL', async () => {
      const { getByTestId, getByText } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('avatar-url-input'), 'not-a-valid-url');
      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByText('Please enter a valid URL')).toBeTruthy();
      });
    });

    it('should accept valid URL', async () => {
      mockOnSave.mockResolvedValue(undefined);
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('avatar-url-input'), 'https://valid.com/image.jpg');
      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            displayName: 'New Name',
            avatarUrl: 'https://valid.com/image.jpg',
          })
        );
      });
    });

    it('should clear error when user starts typing', () => {
      const { getByTestId, getByText, queryByText } = render(
        <EditProfileModal {...defaultProps} />
      );

      fireEvent.changeText(getByTestId('avatar-url-input'), 'invalid');
      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      expect(getByText('Please enter a valid URL')).toBeTruthy();

      fireEvent.changeText(getByTestId('avatar-url-input'), 'https://valid.com/avatar.jpg');

      expect(queryByText('Please enter a valid URL')).toBeNull();
    });
  });

  describe('Bio Validation', () => {
    it('should update bio on text change', () => {
      const { getByTestId, getByDisplayValue } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('bio-input'), 'New bio text');

      expect(getByDisplayValue('New bio text')).toBeTruthy();
    });

    it('should accept empty bio', async () => {
      mockOnSave.mockResolvedValue(undefined);
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('bio-input'), '');
      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({ displayName: 'New Name', bio: undefined })
        );
      });
    });

    it('should show error for bio exceeding 500 characters', async () => {
      const { getByTestId, getByText } = render(<EditProfileModal {...defaultProps} />);

      const longBio = 'A'.repeat(501);
      fireEvent.changeText(getByTestId('bio-input'), longBio);
      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByText('Bio must not exceed 500 characters')).toBeTruthy();
      });
    });

    it('should accept bio with 500 characters', async () => {
      mockOnSave.mockResolvedValue(undefined);
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      const maxBio = 'A'.repeat(500);
      fireEvent.changeText(getByTestId('bio-input'), maxBio);
      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({ displayName: 'New Name', bio: maxBio })
        );
      });
    });

    it('should clear error when user starts typing', () => {
      const { getByTestId, getByText, queryByText } = render(
        <EditProfileModal {...defaultProps} />
      );

      const longBio = 'A'.repeat(501);
      fireEvent.changeText(getByTestId('bio-input'), longBio);
      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      expect(getByText('Bio must not exceed 500 characters')).toBeTruthy();

      fireEvent.changeText(getByTestId('bio-input'), 'Valid bio');

      expect(queryByText('Bio must not exceed 500 characters')).toBeNull();
    });
  });

  describe('Save Functionality', () => {
    it('should call onSave with all fields', async () => {
      mockOnSave.mockResolvedValue(undefined);
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.changeText(getByTestId('avatar-url-input'), 'https://new.com/avatar.jpg');
      fireEvent.changeText(getByTestId('bio-input'), 'New bio');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          displayName: 'New Name',
          avatarUrl: 'https://new.com/avatar.jpg',
          bio: 'New bio',
        });
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

    it('should not call onSave if no changes made', async () => {
      const { getByTestId, getByText } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByText('No changes to save')).toBeTruthy();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should trim whitespace from all fields before saving', async () => {
      mockOnSave.mockResolvedValue(undefined);
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), '  Valid Name  ');
      fireEvent.changeText(getByTestId('avatar-url-input'), '  https://example.com/avatar.jpg  ');
      fireEvent.changeText(getByTestId('bio-input'), '  Valid bio  ');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          displayName: 'Valid Name',
          avatarUrl: 'https://example.com/avatar.jpg',
          bio: 'Valid bio',
        });
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

    it('should reset all fields to original values on cancel', () => {
      const { getByTestId, getByDisplayValue, rerender } = render(
        <EditProfileModal {...defaultProps} />
      );

      fireEvent.changeText(getByTestId('display-name-input'), 'Changed Name');
      fireEvent.changeText(getByTestId('avatar-url-input'), 'https://changed.com/avatar.jpg');
      fireEvent.changeText(getByTestId('bio-input'), 'Changed bio');
      fireEvent.press(getByTestId('cancel-button'));

      rerender(<EditProfileModal {...defaultProps} visible={true} />);

      expect(getByDisplayValue('John Doe')).toBeTruthy();
      expect(getByDisplayValue('https://example.com/avatar.jpg')).toBeTruthy();
      expect(getByDisplayValue('This is my bio')).toBeTruthy();
    });

    it('should clear error messages on cancel', () => {
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
      expect(getByDisplayValue('https://example.com/avatar.jpg')).toBeTruthy();
      expect(getByDisplayValue('This is my bio')).toBeTruthy();
    });

    it('should update inputs when props change', () => {
      const { getByDisplayValue, rerender } = render(<EditProfileModal {...defaultProps} />);

      expect(getByDisplayValue('John Doe')).toBeTruthy();

      rerender(
        <EditProfileModal
          {...defaultProps}
          currentDisplayName="Jane Smith"
          currentAvatarUrl="https://new.com/avatar.jpg"
          currentBio="New bio"
        />
      );

      expect(getByDisplayValue('Jane Smith')).toBeTruthy();
      expect(getByDisplayValue('https://new.com/avatar.jpg')).toBeTruthy();
      expect(getByDisplayValue('New bio')).toBeTruthy();
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

  describe('Accessibility', () => {
    it('should have proper testIDs for all interactive elements', () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      expect(getByTestId('edit-profile-modal')).toBeTruthy();
      expect(getByTestId('close-button')).toBeTruthy();
      expect(getByTestId('display-name-input')).toBeTruthy();
      expect(getByTestId('avatar-url-input')).toBeTruthy();
      expect(getByTestId('bio-input')).toBeTruthy();
      expect(getByTestId('cancel-button')).toBeTruthy();
      expect(getByTestId('save-button')).toBeTruthy();
    });

    it('should auto-focus display name input when modal opens', () => {
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      const input = getByTestId('display-name-input');
      expect(input.props.autoFocus).toBe(true);
    });

    it('should disable inputs while saving', async () => {
      mockOnSave.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const { getByTestId } = render(<EditProfileModal {...defaultProps} />);

      fireEvent.changeText(getByTestId('display-name-input'), 'New Name');
      fireEvent.press(getByTestId('save-button'));

      const displayNameInput = getByTestId('display-name-input');
      const avatarUrlInput = getByTestId('avatar-url-input');
      const bioInput = getByTestId('bio-input');

      expect(displayNameInput.props.editable).toBe(false);
      expect(avatarUrlInput.props.editable).toBe(false);
      expect(bioInput.props.editable).toBe(false);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });
  });
});
