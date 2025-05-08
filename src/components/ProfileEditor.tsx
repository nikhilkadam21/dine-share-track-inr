
import React, { useState, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/data/types';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Camera, Check } from 'lucide-react';

const defaultProfile: UserProfile = {
  id: uuidv4(),
  name: 'User',
  email: '',
  phone: '',
};

const ProfileEditor: React.FC = () => {
  const [profile, setProfile] = useLocalStorage<UserProfile>('user-profile', defaultProfile);
  const { toast } = useToast();
  
  const [name, setName] = useState<string>(profile.name);
  const [email, setEmail] = useState<string>(profile.email);
  const [phone, setPhone] = useState<string>(profile.phone);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      setProfile({
        ...profile,
        name,
        email,
        phone,
      });
      
      setIsSaving(false);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    }, 600);
  };
  
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfile({
        ...profile,
        avatar: result,
      });
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated",
      });
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <Card className="w-full overflow-hidden animate-fade-in border border-slate-200 shadow-lg rounded-xl">
      <CardHeader className="relative p-0 h-32 bg-gradient-to-r from-food-orange to-food-yellow">
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative group">
            <Avatar className="w-32 h-32 border-4 border-white shadow-xl transition-transform hover:scale-105">
              <AvatarImage src={profile.avatar} className="object-cover" />
              <AvatarFallback className="bg-food-green text-white text-2xl">
                {profile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <button 
              className="absolute bottom-0 right-0 bg-food-green text-white p-2 rounded-full shadow-lg opacity-90 hover:opacity-100 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-5 w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-20 pb-6 px-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="transition-all focus:ring-food-orange"
                disabled={!isEditing && !isSaving}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-all focus:ring-food-orange"
                disabled={!isEditing && !isSaving}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="transition-all focus:ring-food-orange"
                disabled={!isEditing && !isSaving}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            {!isEditing ? (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="transition-all"
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="transition-all"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-food-green hover:bg-food-green/90 transition-all"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">⏳</span> Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Check className="mr-2 h-4 w-4" /> Save Changes
                    </span>
                  )}
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileEditor;
