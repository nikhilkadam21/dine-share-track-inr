
import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

interface AppSettings {
  language: string;
  currency: string;
  currencySymbol: string;
  darkMode: boolean;
  notificationsEnabled: boolean;
}

const defaultSettings: AppSettings = {
  language: 'en-IN',
  currency: 'INR',
  currencySymbol: '₹',
  darkMode: false,
  notificationsEnabled: true
};

const languages = [
  { value: 'en-IN', label: 'English (India)' },
  { value: 'hi-IN', label: 'Hindi' },
  { value: 'bn-IN', label: 'Bengali' },
  { value: 'ta-IN', label: 'Tamil' },
  { value: 'te-IN', label: 'Telugu' },
  { value: 'kn-IN', label: 'Kannada' },
  { value: 'ml-IN', label: 'Malayalam' },
];

const currencies = [
  { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
];

const Settings: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('app-settings', defaultSettings);
  const { toast } = useToast();
  
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  
  const handleLanguageChange = (value: string) => {
    setLocalSettings(prev => ({ ...prev, language: value }));
  };
  
  const handleCurrencyChange = (value: string) => {
    const selectedCurrency = currencies.find(c => c.value === value);
    if (selectedCurrency) {
      setLocalSettings(prev => ({ 
        ...prev, 
        currency: value,
        currencySymbol: selectedCurrency.symbol
      }));
    }
  };
  
  const handleToggleChange = (key: keyof AppSettings, value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const saveSettings = () => {
    setSettings(localSettings);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Settings</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select 
                  value={localSettings.language} 
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(language => (
                      <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select your preferred language for the application
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={localSettings.currency} 
                  onValueChange={handleCurrencyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Set the default currency for new expenses
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode" className="block">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use dark theme for the application (coming soon)
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={localSettings.darkMode}
                  onCheckedChange={(checked) => handleToggleChange('darkMode', checked)}
                  disabled
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="block">Notifications</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enable or disable expense reminders and settlement notifications
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={localSettings.notificationsEnabled}
                  onCheckedChange={(checked) => handleToggleChange('notificationsEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={saveSettings}>Save Settings</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
