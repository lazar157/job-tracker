import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config"; // Import Firestore instance

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        username,
        email,
        phoneNumber,
        dateOfBirth,
        address,
        createdAt: new Date().toISOString(),
      });

      navigate("/");
    } catch (err) {
      setError("Failed to register. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          className="w-full p-2 border rounded"
          required
        />
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-2 border rounded"
          required
        />
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
          required
        />
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded"
          required
        />
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className="w-full p-2 border rounded"
          required
        />
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Phone Number"
          className="w-full p-2 border rounded"
        />
        <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
          Profile Picture
        </label>
        <input
          type="file"
          onChange={(e) => setProfilePicture(e.target.files ? e.target.files[0] : null)}
          className="w-full p-2 border rounded"
        />
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
          Date of Birth
        </label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          placeholder="Date of Birth"
          className="w-full p-2 border rounded"
        />
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          Register
        </button>
      </form>
      <div className="mt-4 text-center">
        <p>Already have an account?</p>
        <button
          onClick={() => navigate("/login")}
          className="text-blue-500 underline"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;