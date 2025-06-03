"use client";

import { UserForm } from "@/components/admin/UserForm";
import { useAuth } from "@/lib/auth/AuthContext";
import { Role } from "@/lib/auth/roles";
import { User } from "@/lib/db/database";
import { useState } from "react";

export default function UserManagementPage() {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (data: {
    name: string;
    email: string;
    password?: string;
    role: Role;
  }) => {
    // TODO: Implement user creation/update logic
    console.log("Form submitted:", data);
    handleCloseForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--text)]">
          User Management
        </h1>
        <button
          onClick={handleAddUser}
          className="bg-[var(--primary)] text-white px-4 py-2 rounded hover:bg-[var(--primary)]/90 transition-colors"
        >
          Add User
        </button>
      </div>

      {/* User List */}
      <div className="bg-[var(--card)] rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--background)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text)]/70 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text)]/70 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text)]/70 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text)]/70 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text)]/70 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-[var(--text)]">
                  No users found
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[var(--text)]"></td>
                <td className="px-6 py-4 whitespace-nowrap text-[var(--text)]"></td>
                <td className="px-6 py-4 whitespace-nowrap text-[var(--text)]"></td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-[var(--card)] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
              {selectedUser ? "Edit User" : "Add User"}
            </h2>
            <UserForm
              initialData={
                selectedUser
                  ? {
                      id: selectedUser.id,
                      name: selectedUser.name,
                      email: selectedUser.email,
                      role: selectedUser.role as Role,
                    }
                  : undefined
              }
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}
