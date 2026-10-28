/**
 * Native Haptic Feedback Utility
 * Provides subtle tactile feedback on mobile devices via the Web Vibration API.
 */
export const haptics = {
  /**
   * Subtle tick for tab bar switches, segmented pills, or selection changes
   */
  selection: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch {
        // Ignore devices where vibration isn't permitted
      }
    }
  },

  /**
   * Light impact for general button presses, card taps
   */
  light: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // Ignore
      }
    }
  },

  /**
   * Medium impact for primary actions, floating button, pull-to-refresh snap
   */
  medium: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(22);
      } catch {
        // Ignore
      }
    }
  },

  /**
   * Firm impact for bottom sheet dismiss or destructive actions
   */
  heavy: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(35);
      } catch {
        // Ignore
      }
    }
  },

  /**
   * Notification feedback on success
   */
  success: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([10, 35, 15]);
      } catch {
        // Ignore
      }
    }
  },

  /**
   * Notification feedback on error / warning
   */
  error: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([25, 40, 25, 40, 25]);
      } catch {
        // Ignore
      }
    }
  }
};
