// useProfileSetup — encapsulates form state, validation, S3 avatar upload,
// and the updateProfile mutation for the profile setup page.

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_PROFILE_MUTATION, GET_UPLOAD_URL_MUTATION } from '../graphql/mutations';
import type { ProfileForm, ProfileFormErrors, GuitarType, Motivation } from '../types';

const DISPLAY_NAME_RE = /^[a-zA-Z0-9_-]{2,30}$/;

export const useProfileSetup = () => {
  const [form, setForm] = useState<ProfileForm>({
    displayName: '',
    avatarUrl:   '',
    guitarType:  null,
    motivation:  null,
  });
  const [errors, setErrors]               = useState<ProfileFormErrors>({});
  const [toast, setToast]                 = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [updateProfileMutation] = useMutation(UPDATE_PROFILE_MUTATION);
  const [getUploadUrlMutation]  = useMutation(GET_UPLOAD_URL_MUTATION);

  // ── Field helpers ─────────────────────────────────────────────────────────

  const setField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const validateDisplayName = (v: string): string | undefined => {
    if (!v)             return 'Display name is required.';
    if (v.length < 2)   return 'Must be at least 2 characters.';
    if (v.length > 30)  return 'Must be 30 characters or fewer.';
    if (!DISPLAY_NAME_RE.test(v)) return 'Only letters, numbers, hyphens, and underscores.';
  };

  const validateAll = (): boolean => {
    const next: ProfileFormErrors = {
      displayName: validateDisplayName(form.displayName),
      avatarUrl:   form.avatarUrl  ? undefined : 'Please select or upload an avatar.',
      guitarType:  form.guitarType ? undefined : 'Please select a guitar type.',
      motivation:  form.motivation ? undefined : 'Please select your motivation.',
    };
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const isFormValid = () =>
    DISPLAY_NAME_RE.test(form.displayName) &&
    !!form.avatarUrl &&
    !!form.guitarType &&
    !!form.motivation;

  // ── Avatar upload ─────────────────────────────────────────────────────────

  const uploadAvatar = async (file: File): Promise<string> => {
    setAvatarUploading(true);
    try {
      const { data } = await getUploadUrlMutation({
        variables: {
          filename:    `avatars/${Date.now()}-${file.name}`,
          contentType: file.type,
        },
      });
      const { uploadUrl, publicUrl } = data.getUploadUrl;
      const res = await fetch(uploadUrl, {
        method:  'PUT',
        body:    file,
        headers: { 'Content-Type': file.type },
      });
      if (!res.ok) throw new Error('PUT failed');
      return publicUrl as string;
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const submit = async (): Promise<boolean> => {
    if (!validateAll()) return false;
    setLoading(true);
    try {
      await updateProfileMutation({
        variables: {
          input: {
            displayName: form.displayName,
            avatarUrl:   form.avatarUrl,
            guitarType:  form.guitarType  as GuitarType,
            motivation:  form.motivation  as Motivation,
          },
        },
      });
      return true;
    } catch {
      setToast("Couldn't save profile, please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    loading,
    toast,
    avatarUploading,
    setField,
    uploadAvatar,
    submit,
    isFormValid,
    validateDisplayName,
    dismissToast: () => setToast(null),
  };
};
