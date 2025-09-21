// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Mail, Lock, User, GraduationCap, Eye, EyeOff } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';
// import toast from 'react-hot-toast';

// interface SignupFormProps {
//   onSwitchToLogin: () => void;
//   onSignupSuccess: (email: string) => void;
// }

// export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onSignupSuccess }) => {
// const [formData, setFormData] = useState({
//   name: '', // We'll handle this in the onChange handler
//   email: '',
//   rollNumber: '',
//   password: '',
//   confirmPassword: '',
//   firstName: '', // New field
//   lastName: '',  // New field
//   course: '',
//   branch: '',
//   year: '',
//   dateOfBirth: '',
//   gender: '',
//   interestedIn: '',
// });
//   const [showPassword, setShowPassword] = useState(false);
//   const { signup, loading } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.name || !formData.email || !formData.rollNumber || !formData.password) {
//       toast.error('Please fill in all fields');
//       return;
//     }

//     if (!formData.email.endsWith('@nitm.ac.in')) {
//       toast.error('Please use your official NITM email address');
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     const success = await signup(formData);
//     if (success) {
//       toast.success('Account created! Please verify your email.');
//       onSignupSuccess(formData.email);
//     } else {
//       toast.error('Failed to create account');
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, x: 20 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: 20 }}
//     >
//       <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Join NITM Hub</h2>
      
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Full Name
//           </label>
//           <div className="relative">
//             <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Enter your full name"
//             />
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             College Email
//           </label>
//           <div className="relative">
//             <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="your.name@nitm.ac.in"
//             />
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Roll Number
//           </label>
//           <div className="relative">
//             <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type="text"
//               name="rollNumber"
//               value={formData.rollNumber}
//               onChange={handleChange}
//               className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="CS21B1001"
//             />
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Password
//           </label>
//           <div className="relative">
//             <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type={showPassword ? 'text' : 'password'}
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Create a password"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//             >
//               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Confirm Password
//           </label>
//           <div className="relative">
//             <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type="password"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Confirm your password"
//             />
//           </div>
//         </div>

//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           type="submit"
//           disabled={loading}
//           className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? 'Creating Account...' : 'Create Account'}
//         </motion.button>
//       </form>

//       <div className="mt-6 text-center">
//         <p className="text-gray-600">
//           Already have an account?{' '}
//           <button
//             onClick={onSwitchToLogin}
//             className="text-blue-600 hover:text-blue-700 font-semibold"
//           >
//             Sign In
//           </button>
//         </p>
//       </div>
//     </motion.div>
//   );
// };






import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSignupSuccess: (email: string) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    rollNumber: '',
    password: '',
    confirmPassword: '',
    course: '',
    branch: '',
    year: '',
    dateOfBirth: '',
    gender: '',
    interestedIn: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { signup, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all required fields are filled
    const requiredFields = ['firstName', 'lastName', 'email', 'rollNumber', 'password', 'course', 'branch', 'year', 'dateOfBirth', 'gender'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.email.endsWith('@nitm.ac.in')) {
      toast.error('Please use your official NITM email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const success = await signup(formData);
    if (success) {
      toast.success('Account created! Please verify your email.');
      onSignupSuccess(formData.email);
    } else {
      toast.error('Failed to create account');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Join NITM Hub</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name and Last Name */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your first name"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <div className="relative">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your last name"
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">College Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your.name@nitm.ac.in"
            />
          </div>
        </div>

        {/* Roll Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="CS21B1001"
            />
          </div>
        </div>
        
        {/* Course */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
          <input
            type="text"
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., B.Tech"
          />
        </div>

        {/* Branch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
          <input
            type="text"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Computer Science Engineering"
          />
        </div>

        {/* Year and Date of Birth */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 2024"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Gender and Interested In */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Interested In</label>
            <input
              type="text"
              name="interestedIn"
              value={formData.interestedIn}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Football, Coding"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm your password"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </motion.button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Sign In
          </button>
        </p>
      </div>
    </motion.div>
  );
};