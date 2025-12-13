import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currentDisplayName: string;
  currentAvatarUrl?: string;
  currentBio?: string;
  onSave: (data: { displayName: string; avatarUrl?: string; bio?: string }) => Promise<void>;
}

export function EditProfileModal({
  visible,
  onClose,
  currentDisplayName,
  currentAvatarUrl = '',
  currentBio = '',
  onSave,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [bio, setBio] = useState(currentBio);
  const [errors, setErrors] = useState<{
    displayName?: string;
    avatarUrl?: string;
    bio?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Sync local state when props change
  useEffect(() => {
    if (visible) {
      setDisplayName(currentDisplayName);
      setAvatarUrl(currentAvatarUrl);
      setBio(currentBio);
      setErrors({});
      setSuccessMessage('');
    }
  }, [visible, currentDisplayName, currentAvatarUrl, currentBio]);

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

  const validateAvatarUrl = (url: string): string | null => {
    if (!url || url.trim().length === 0) {
      return null; // Optional field
    }
    // Basic URL validation
    try {
      new URL(url.trim());
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const validateBio = (bioText: string): string | null => {
    if (!bioText || bioText.trim().length === 0) {
      return null; // Optional field
    }
    if (bioText.trim().length > 500) {
      return 'Bio must not exceed 500 characters';
    }
    return null;
  };

  const handleDisplayNameChange = (text: string) => {
    setDisplayName(text);
    if (errors.displayName) {
      setErrors((prev) => ({ ...prev, displayName: undefined }));
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleAvatarUrlChange = (text: string) => {
    setAvatarUrl(text);
    if (errors.avatarUrl) {
      setErrors((prev) => ({ ...prev, avatarUrl: undefined }));
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleBioChange = (text: string) => {
    setBio(text);
    if (errors.bio) {
      setErrors((prev) => ({ ...prev, bio: undefined }));
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSave = async () => {
    const trimmedName = displayName.trim();
    const trimmedUrl = avatarUrl.trim();
    const trimmedBio = bio.trim();

    // Validate all fields
    const nameError = validateDisplayName(trimmedName);
    const urlError = validateAvatarUrl(trimmedUrl);
    const bioError = validateBio(trimmedBio);

    if (nameError || urlError || bioError) {
      setErrors({
        displayName: nameError || undefined,
        avatarUrl: urlError || undefined,
        bio: bioError || undefined,
      });
      return;
    }

    // Check if anything changed
    const hasChanges =
      trimmedName !== currentDisplayName ||
      trimmedUrl !== currentAvatarUrl ||
      trimmedBio !== currentBio;

    if (!hasChanges) {
      setErrors({ displayName: 'No changes to save' });
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      await onSave({
        displayName: trimmedName,
        avatarUrl: trimmedUrl || undefined,
        bio: trimmedBio || undefined,
      });
      setSuccessMessage('Profile updated successfully!');
      // Close modal after a brief delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setErrors({
        displayName: err instanceof Error ? err.message : 'Failed to update profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(currentDisplayName);
    setAvatarUrl(currentAvatarUrl);
    setBio(currentBio);
    setErrors({});
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
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            <Input
              label="Display Name"
              placeholder="Enter your display name"
              value={displayName}
              onChangeText={handleDisplayNameChange}
              error={errors.displayName}
              maxLength={50}
              autoFocus
              testID="display-name-input"
              editable={!isLoading}
            />
            <Text style={styles.characterCount}>{displayName.length} / 50 characters</Text>

            <View style={styles.fieldSpacing} />

            <Input
              label="Avatar URL (optional)"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChangeText={handleAvatarUrlChange}
              error={errors.avatarUrl}
              maxLength={500}
              testID="avatar-url-input"
              editable={!isLoading}
              autoCapitalize="none"
              keyboardType="url"
            />
            <Text style={styles.helpText}>Enter a URL to your profile image</Text>

            <View style={styles.fieldSpacing} />

            <View style={styles.textareaContainer} testID="bio-input-container">
              <Text style={styles.label}>Bio (optional)</Text>
              <TextInput
                style={[styles.textarea, errors.bio ? styles.textareaError : null]}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#6B7280"
                value={bio}
                onChangeText={handleBioChange}
                maxLength={500}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                testID="bio-input"
                editable={!isLoading}
              />
              {errors.bio && (
                <Text style={styles.error} testID="bio-input-error">
                  {errors.bio}
                </Text>
              )}
            </View>
            <Text style={styles.characterCount}>{bio.length} / 500 characters</Text>

            {successMessage && (
              <View style={styles.successContainer} testID="success-message">
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}
          </ScrollView>

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
    maxHeight: '90%',
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
  scrollView: {
    maxHeight: 500,
  },
  content: {
    padding: 24,
  },
  fieldSpacing: {
    height: 16,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  textareaContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: 4,
  },
  textarea: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#374151',
    minHeight: 100,
  },
  textareaError: {
    borderColor: '#EF4444',
  },
  error: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  successContainer: {
    backgroundColor: '#064E3B',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    marginTop: 16,
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
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  actionButton: {
    flex: 1,
  },
});
