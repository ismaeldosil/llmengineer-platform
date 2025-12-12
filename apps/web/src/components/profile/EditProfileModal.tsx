import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currentDisplayName: string;
  onSave: (newName: string) => Promise<void>;
}

export function EditProfileModal({
  visible,
  onClose,
  currentDisplayName,
  onSave,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Sync local state when currentDisplayName prop changes
  useEffect(() => {
    if (visible) {
      setDisplayName(currentDisplayName);
      setError('');
      setSuccessMessage('');
    }
  }, [visible, currentDisplayName]);

  const validateDisplayName = (name: string): string | null => {
    if (!name || name.trim().length === 0) {
      return 'Display name is required';
    }
    if (name.trim().length < 2) {
      return 'Display name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Display name must not exceed 50 characters';
    }
    return null;
  };

  const handleDisplayNameChange = (text: string) => {
    setDisplayName(text);
    // Clear error when user types
    if (error) {
      setError('');
    }
    // Clear success message when user types
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSave = async () => {
    const trimmedName = displayName.trim();
    const validationError = validateDisplayName(trimmedName);

    if (validationError) {
      setError(validationError);
      return;
    }

    // Don't save if nothing changed
    if (trimmedName === currentDisplayName) {
      setError('No changes to save');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await onSave(trimmedName);
      setSuccessMessage('Profile updated successfully!');
      // Close modal after a brief delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(currentDisplayName);
    setError('');
    setSuccessMessage('');
    onClose();
  };

  const handleRequestClose = () => {
    if (!isLoading) {
      handleCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleRequestClose}
      testID="edit-profile-modal"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
            <Pressable
              onPress={handleCancel}
              disabled={isLoading}
              testID="close-button"
              style={[styles.closeButton, isLoading && styles.closeButtonDisabled]}
            >
              <Text style={[styles.closeButtonText, isLoading && styles.closeButtonTextDisabled]}>
                ✕
              </Text>
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Input
              label="Display Name"
              placeholder="Enter your display name"
              value={displayName}
              onChangeText={handleDisplayNameChange}
              error={error}
              maxLength={50}
              autoFocus
              testID="display-name-input"
              editable={!isLoading}
            />

            <Text style={styles.characterCount}>{displayName.length} / 50 characters</Text>

            {successMessage && (
              <View style={styles.successContainer} testID="success-message">
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              onPress={handleCancel}
              variant="secondary"
              disabled={isLoading}
              testID="cancel-button"
              style={styles.actionButton}
            >
              Cancel
            </Button>
            <Button
              onPress={handleSave}
              variant="primary"
              loading={isLoading}
              disabled={isLoading}
              testID="save-button"
              style={styles.actionButton}
            >
              Save
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonDisabled: {
    opacity: 0.5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  closeButtonTextDisabled: {
    color: '#6B7280',
  },
  content: {
    padding: 24,
    gap: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  successContainer: {
    backgroundColor: '#064E3B',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    marginTop: 8,
  },
  successText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    paddingTop: 0,
  },
  actionButton: {
    flex: 1,
  },
});
