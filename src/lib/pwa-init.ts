// PWA Features Initialization Script
import { pwaManager } from '@/lib/pwa'
import { offlineManager } from '@/lib/offline'
import { shareManager } from '@/lib/share'
import { biometricAuth } from '@/lib/biometric'
import { deepLinkManager } from '@/lib/deeplink'
import { appShortcutsManager } from '@/lib/app-shortcuts'

// Initialize all PWA features
export async function initializePWAFeatures() {
  console.log('[PWA] Initializing PWA features...')

  try {
    // Initialize PWA core features
    await pwaManager.init()
    console.log('[PWA] ✅ PWA Manager initialized')

    // Initialize offline data management
    await offlineManager.init()
    console.log('[PWA] ✅ Offline Manager initialized')

    // Initialize deep linking
    deepLinkManager.init()
    console.log('[PWA] ✅ Deep Link Manager initialized')

    // Initialize app shortcuts
    await appShortcutsManager.init()
    console.log('[PWA] ✅ App Shortcuts Manager initialized')

    // Check biometric authentication availability
    const biometricAvailable = await biometricAuth.isBiometricAvailable()
    console.log('[PWA] ✅ Biometric Auth checked:', biometricAvailable)

    // Check Web Share API availability
    const shareSupported = shareManager.isSupported
    console.log('[PWA] ✅ Web Share API checked:', shareSupported)

    // Setup global PWA object for easy access
    window.pwaFeatures = {
      pwaManager,
      offlineManager,
      shareManager,
      biometricAuth,
      deepLinkManager,
      appShortcutsManager,
      isOnline: navigator.onLine,
      isInstalled: window.matchMedia('(display-mode: standalone)').matches
    }

    console.log('[PWA] 🎉 All PWA features initialized successfully!')
    
    return true
  } catch (error) {
    console.error('[PWA] ❌ Failed to initialize PWA features:', error)
    return false
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePWAFeatures)
  } else {
    initializePWAFeatures()
  }
}

// Export for manual initialization
export default initializePWAFeatures