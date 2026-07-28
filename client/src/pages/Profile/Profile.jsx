import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/Cards/Card";
import Button from "../../components/Buttons/Button";
import { User, Mail, Calendar, Edit2, Save, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

const Profile = () => {
  const auth = useAuth();
  const user = auth?.user;
  const setUser = auth?.setUser;

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    if (!formData.username?.trim() || !formData.email?.trim()) {
      return toast.error("Name and email are required");
    }

    setLoading(true);
    try {
      const res = await api.put("/auth/profile", formData);
      const updatedUser = res.data?.user || res.data;

      if (updatedUser && typeof setUser === "function") {
        setUser(updatedUser);
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }

    setLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password changed successfully!");
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 md:space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
          Manage your account information
        </p>
      </div>

      {/* Profile Header */}
      <Card className="flex flex-col items-center gap-5 p-5 md:p-8 md:flex-row md:gap-8">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center text-4xl md:text-6xl text-white font-light shadow-inner flex-shrink-0">
          {user?.username?.charAt(0).toUpperCase() || "U"}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            {user?.username}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base break-all">
            {user?.email}
          </p>
          <p className="text-sm text-emerald-600 font-medium mt-2">
            Member since July 2026
          </p>
        </div>

        <Button
          onClick={isEditing ? saveProfile : () => setIsEditing(true)}
          variant={isEditing ? "primary" : "outline"}
          disabled={isEditing && loading}
          className="flex items-center gap-2 w-full md:w-auto"
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          <span className="text-sm">{isEditing ? "Save" : "Edit Profile"}</span>
        </Button>
      </Card>

      {/* Account Information */}
      <Card title="Account Information">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-emerald-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-gray-800 dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-emerald-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-gray-800 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
              Member Since
            </label>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-gray-800 dark:text-white text-sm">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>July 2026</span>
            </div>
          </div>
        </div>

        {isEditing && (
          <Button onClick={saveProfile} disabled={loading} className="mt-5 w-full">
            {loading ? "Saving..." : "Save Profile Changes"}
          </Button>
        )}
      </Card>

      {/* Security Section */}
      <Card title="Security">
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start flex items-center gap-3"
            onClick={() => setShowPasswordChange(!showPasswordChange)}
          >
            <Lock className="w-5 h-5" />
            Change Password
          </Button>

          {showPasswordChange && (
            <div className="space-y-4 p-4 md:p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl mt-2">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl pr-12 text-gray-800 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-4 top-3 text-gray-400"
                  >
                    {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl pr-12 text-gray-800 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-4 top-3 text-gray-400"
                  >
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl pr-12 text-gray-800 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-4 top-3 text-gray-400"
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button onClick={changePassword} disabled={loading} className="w-full mt-2">
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;