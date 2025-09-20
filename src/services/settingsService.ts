import { PortfolioSettings } from '../types/portfolio';

export class SettingsService {
  private settings: PortfolioSettings;
  private listeners: Array<(settings: PortfolioSettings) => void> = [];

  constructor() {
    this.settings = this.loadSettings();
  }

  // Subscribe to settings changes
  subscribe(listener: (settings: PortfolioSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private notify(): void {
    this.listeners.forEach(listener => listener({ ...this.settings }));
  }

  // Get current settings
  getSettings(): PortfolioSettings {
    return { ...this.settings };
  }

  // Update settings
  updateSettings(updates: Partial<PortfolioSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
    this.notify();
  }

  // Update specific setting category
  updateCurrency(currency: string): void {
    this.updateSettings({ defaultCurrency: currency });
  }

  updateRefreshInterval(interval: number): void {
    this.updateSettings({ refreshInterval: interval });
  }

  updateNotifications(notifications: Partial<PortfolioSettings['notifications']>): void {
    this.updateSettings({
      notifications: { ...this.settings.notifications, ...notifications }
    });
  }

  updatePrivacy(privacy: Partial<PortfolioSettings['privacy']>): void {
    this.updateSettings({
      privacy: { ...this.settings.privacy, ...privacy }
    });
  }

  updateDisplay(display: Partial<PortfolioSettings['display']>): void {
    this.updateSettings({
      display: { ...this.settings.display, ...display }
    });
  }

  // Get available currencies
  getAvailableCurrencies(): Array<{ code: string; name: string; symbol: string }> {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    ];
  }

  // Get available refresh intervals
  getAvailableRefreshIntervals(): Array<{ value: number; label: string }> {
    return [
      { value: 10000, label: '10 seconds' },
      { value: 30000, label: '30 seconds' },
      { value: 60000, label: '1 minute' },
      { value: 300000, label: '5 minutes' },
      { value: 600000, label: '10 minutes' },
      { value: 1800000, label: '30 minutes' },
      { value: 3600000, label: '1 hour' },
    ];
  }

  // Get available themes
  getAvailableThemes(): Array<{ value: string; label: string }> {
    return [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'auto', label: 'Auto (System)' },
    ];
  }

  // Reset settings to default
  resetToDefault(): void {
    this.settings = this.getDefaultSettings();
    this.saveSettings();
    this.notify();
  }

  // Get default settings
  private getDefaultSettings(): PortfolioSettings {
    return {
      defaultCurrency: 'USD',
      refreshInterval: 30000, // 30 seconds
      notifications: {
        priceAlerts: true,
        riskAlerts: true,
        opportunityAlerts: true,
      },
      privacy: {
        hideSmallBalances: true,
        hideZeroBalances: true,
        minBalanceThreshold: 5,
      },
      display: {
        theme: 'auto',
        compactMode: false,
        showCharts: true,
      },
    };
  }

  // Load settings from localStorage
  private loadSettings(): PortfolioSettings {
    try {
      const stored = localStorage.getItem('omni-folio-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.getDefaultSettings(), ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    
    return this.getDefaultSettings();
  }

  // Save settings to localStorage
  private saveSettings(): void {
    try {
      localStorage.setItem('omni-folio-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  // Export settings
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  // Import settings
  importSettings(settingsJson: string): boolean {
    try {
      const imported = JSON.parse(settingsJson);
      this.settings = { ...this.getDefaultSettings(), ...imported };
      this.saveSettings();
      this.notify();
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  // Validate settings
  validateSettings(settings: any): boolean {
    try {
      // Check required fields
      if (!settings.defaultCurrency || typeof settings.defaultCurrency !== 'string') {
        return false;
      }
      
      if (!settings.refreshInterval || typeof settings.refreshInterval !== 'number') {
        return false;
      }
      
      if (!settings.notifications || typeof settings.notifications !== 'object') {
        return false;
      }
      
      if (!settings.privacy || typeof settings.privacy !== 'object') {
        return false;
      }
      
      if (!settings.display || typeof settings.display !== 'object') {
        return false;
      }
      
      // Validate currency
      const validCurrencies = this.getAvailableCurrencies().map(c => c.code);
      if (!validCurrencies.includes(settings.defaultCurrency)) {
        return false;
      }
      
      // Validate refresh interval
      const validIntervals = this.getAvailableRefreshIntervals().map(i => i.value);
      if (!validIntervals.includes(settings.refreshInterval)) {
        return false;
      }
      
      // Validate theme
      const validThemes = this.getAvailableThemes().map(t => t.value);
      if (!validThemes.includes(settings.display.theme)) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get settings summary
  getSettingsSummary(): {
    currency: string;
    refreshInterval: string;
    notifications: number;
    theme: string;
  } {
    const currency = this.getAvailableCurrencies().find(c => c.code === this.settings.defaultCurrency);
    const interval = this.getAvailableRefreshIntervals().find(i => i.value === this.settings.refreshInterval);
    const theme = this.getAvailableThemes().find(t => t.value === this.settings.display.theme);
    
    const notificationCount = Object.values(this.settings.notifications).filter(Boolean).length;
    
    return {
      currency: currency?.name || this.settings.defaultCurrency,
      refreshInterval: interval?.label || 'Unknown',
      notifications: notificationCount,
      theme: theme?.label || this.settings.display.theme,
    };
  }

  // Clear all settings
  clearSettings(): void {
    localStorage.removeItem('omni-folio-settings');
    this.settings = this.getDefaultSettings();
    this.notify();
  }

  // Get settings version (for migration purposes)
  getSettingsVersion(): string {
    return '1.0.0';
  }

  // Migrate settings from older versions
  migrateSettings(version: string): void {
    // This would handle migration from older settings formats
    // For now, just reset to default if version mismatch
    if (version !== this.getSettingsVersion()) {
      this.resetToDefault();
    }
  }
}
