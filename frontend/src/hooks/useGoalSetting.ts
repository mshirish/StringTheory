import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SET_LEARNING_GOAL_MUTATION } from '../graphql/mutations';
import type { LearningGoalId } from '../types';

export const useGoalSetting = () => {
  const [selectedGoal, setSelectedGoal]   = useState<LearningGoalId | null>(null);
  const [modalOpen,    setModalOpen]      = useState(false);
  const [error,        setError]          = useState<string | null>(null);

  const [setLearningGoal, { loading }] = useMutation(SET_LEARNING_GOAL_MUTATION);

  const selectGoal = (id: LearningGoalId) => {
    setSelectedGoal(id);
    setError(null);
  };

  const clearGoal = () => {
    setSelectedGoal(null);
    setModalOpen(false);
  };

  const openModal = () => {
    if (selectedGoal) setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // Returns true on success so the page can navigate away.
  const confirmGoal = async (): Promise<boolean> => {
    if (!selectedGoal) return false;
    setError(null);
    try {
      await setLearningGoal({ variables: { goal: selectedGoal } });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      return false;
    }
  };

  return {
    selectedGoal,
    modalOpen,
    loading,
    error,
    selectGoal,
    clearGoal,
    openModal,
    closeModal,
    confirmGoal,
  };
};
