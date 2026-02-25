"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Shield, Mail, Phone, Globe, MapPin, Calendar, Clock,
    Fingerprint, Lock, LockOpen, Ban, ShieldCheck, ShieldBan, Trash2,
    Eye, EyeOff, UserCog, Send, X, Loader2, ChevronRight,
    MoreVertical, AlertTriangle, Download, StickyNote, Plus,
    Monitor, Smartphone, Activity, Star, ExternalLink,
    CheckCircle2, XCircle, TicketIcon, Gavel, Bold, Italic,
    List, Paperclip, RotateCcw, FilePlus, PenTool, Bot, User, LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminService, AdminUserDetail } from "@/lib/admin-service";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

type TabId = "overview" | "events" | "tickets" | "activity" | "security" | "notes";

const TABS: { id: TabId; label: string; countKey?: keyof AdminUserDetail }[] = [
    { id: "overview", label: "Overview" },
    { id: "events", label: "Events", countKey: "created_events" },
    { id: "tickets", label: "Tickets" },
    { id: "activity", label: "Activity" },
    { id: "security", label: "Security" },
    { id: "notes", label: "Admin Notes", countKey: "admin_notes" },
];

const ROLE_STYLES: Record<string, string> = {
    admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    organizer: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border-primary-200 dark:border-primary-800",
    user: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600",
};

const STATUS_STYLES: Record<string, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    suspended: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    banned: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
};

const EVENT_STATUS: Record<string, string> = {
    upcoming: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    ongoing: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    completed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    cancelled: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    draft: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    published: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

// --- Modal Component ---
function ActionModal({ open, onClose, title, icon, children, danger }: {
    open: boolean; onClose: () => void; title: string; icon: React.ReactNode;
    children: React.ReactNode; danger?: boolean;
}) {
    if (!open) return null;
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={onClose}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md"
                    onClick={e => e.stopPropagation()}>
                    <div className={cn("flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700", danger && "bg-red-50 dark:bg-red-900/10")}>
                        <div className={cn("p-2 rounded-lg", danger ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400")}>
                            {icon}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex-1">{title}</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-6">{children}</div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function AdminUserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [user, setUser] = useState<AdminUserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabId>("overview");

    // Modal states
    const [modal, setModal] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [suspendReason, setSuspendReason] = useState("");
    const [suspendDuration, setSuspendDuration] = useState("");
    const [banReason, setBanReason] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [actionResult, setActionResult] = useState<{ success: boolean; message: string } | null>(null);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminService.getUser(userId);
            setUser(data);
        } catch (err) {
            console.error("Failed to fetch user:", err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchUser(); }, [fetchUser]);

    const handleAction = async (action: () => Promise<void>, successMsg: string) => {
        setActionLoading(true);
        try {
            await action();
            setActionResult({ success: true, message: successMsg });
            await fetchUser();
            setTimeout(() => { setModal(null); setActionResult(null); }, 1500);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Action failed";
            setActionResult({ success: false, message });
        } finally {
            setActionLoading(false);
        }
    };

    const handleSuspend = () => handleAction(
        () => adminService.suspendUser(userId, suspendReason, suspendDuration ? parseInt(suspendDuration) : undefined),
        "User suspended successfully"
    );
    const handleBan = () => handleAction(() => adminService.banUser(userId, banReason), "User banned successfully");
    const handleUnsuspend = () => handleAction(() => adminService.unsuspendUser(userId), "User unsuspended");
    const handleVerify = () => handleAction(() => adminService.verifyUser(userId), "Email verified");
    const handleDelete = () => handleAction(() => adminService.deleteUser(userId), "User deleted");
    const handleResetPassword = () => handleAction(() => adminService.resetPassword(userId), "Password reset email sent");
    const handleImpersonate = () => handleAction(() => adminService.impersonateUser(userId), "Impersonation session created");
    const handleAddNote = () => handleAction(async () => {
        await adminService.addNote(userId, noteContent);
        setNoteContent("");
    }, "Note added");
    const handleDeleteNote = async (noteId: string) => {
        try {
            await adminService.deleteNote(userId, noteId);
            await fetchUser();
        } catch (e) { console.error(e); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <AlertTriangle className="h-12 w-12 text-slate-400" />
                <p className="text-lg text-slate-500">User not found</p>
                <Link href="/admin/users" className="text-primary-600 hover:underline text-sm font-medium">← Back to Users</Link>
            </div>
        );
    }

    const initials = user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const joinDate = format(new Date(user.created_at), "MMMM yyyy");
    const isSuspendedOrBanned = user.status === "suspended" || user.status === "banned";

    return (
        <div className="-mx-8 -my-0">
            {/* Breadcrumb Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/admin/users" className="hover:text-primary-600 transition-colors flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" /> Users
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="font-medium text-slate-900 dark:text-white">{user.full_name}</span>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 lg:p-10" style={{ height: "calc(100vh - 8rem)" }}>
                {/* Profile Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary-600/10 to-primary-600/5 dark:from-primary-600/20 dark:to-transparent" />
                    <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                            <div className="relative">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.full_name} className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 shadow-md object-cover" />
                                ) : (
                                    <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 shadow-md bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                                        {initials}
                                    </div>
                                )}
                                <span className={cn("absolute bottom-1 right-1 w-5 h-5 border-2 border-white dark:border-slate-900 rounded-full",
                                    user.status === "active" ? "bg-green-500" : user.status === "suspended" ? "bg-orange-500" : user.status === "banned" ? "bg-red-500" : "bg-yellow-500"
                                )} />
                            </div>
                            <div className="text-center md:text-left pb-1">
                                <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.full_name}</h1>
                                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium border capitalize", STATUS_STYLES[user.status] || STATUS_STYLES.active)}>{user.status}</span>
                                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium border capitalize", ROLE_STYLES[user.role] || ROLE_STYLES.user)}>{user.role}</span>
                                    {user.email_verified && (
                                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</span>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400 justify-center md:justify-start">
                                    <span className="flex items-center gap-1"><Fingerprint className="h-4 w-4" /> ID: {user.id.slice(0, 8)}</span>
                                    {user.location && <><span className="hidden md:inline text-slate-300 dark:text-slate-700">•</span><span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {user.location}</span></>}
                                    <span className="hidden md:inline text-slate-300 dark:text-slate-700">•</span>
                                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined {joinDate}</span>
                                </div>
                            </div>
                        </div>
                        {/* Quick Actions */}
                        <div className="flex items-center gap-3 pb-1 w-full md:w-auto justify-center md:justify-end flex-wrap">
                            <button onClick={() => setModal("resetPassword")}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                                <Lock className="h-4 w-4" /> Reset Password
                            </button>
                            {!user.email_verified && (
                                <button onClick={() => setModal("verify")}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                                    <ShieldCheck className="h-4 w-4" /> Verify Email
                                </button>
                            )}
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                            {isSuspendedOrBanned ? (
                                <button onClick={() => handleUnsuspend()}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors">
                                    <LockOpen className="h-4 w-4" /> Unsuspend
                                </button>
                            ) : (
                                <button onClick={() => setModal("suspend")}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors">
                                    <ShieldBan className="h-4 w-4" /> Suspend
                                </button>
                            )}
                            <button onClick={() => setModal("ban")}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                                <Ban className="h-4 w-4" /> Ban
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-8 flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                        {TABS.map(tab => {
                            const count = tab.countKey && user ? (user[tab.countKey] as unknown[])?.length : undefined;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={cn("px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                                        activeTab === tab.id
                                            ? "text-primary-600 border-b-2 border-primary-600"
                                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                    )}>
                                    {tab.label}
                                    {count !== undefined && count > 0 && (
                                        <span className="ml-1 text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-600 dark:text-slate-400">{count}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && <OverviewTab user={user} />}
                {activeTab === "events" && <EventsTab user={user} />}
                {activeTab === "tickets" && <TicketsTab />}
                {activeTab === "activity" && <ActivityTab user={user} />}
                {activeTab === "security" && <SecurityTab user={user} onRefresh={fetchUser} />}
                {activeTab === "notes" && <NotesTab user={user} noteContent={noteContent} setNoteContent={setNoteContent} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} actionLoading={actionLoading} />}
            </div>

            {/* Modals */}
            <ActionModal open={modal === "suspend"} onClose={() => setModal(null)} title="Suspend User" icon={<ShieldBan className="h-5 w-5" />}>
                {actionResult ? <p className={cn("text-sm font-medium", actionResult.success ? "text-green-600" : "text-red-600")}>{actionResult.message}</p> : (<>
                    <p className="text-sm text-slate-500 mb-4">This will immediately revoke the user&apos;s access.</p>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason *</label>
                    <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} rows={3}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-3 focus:ring-primary-600 focus:border-primary-600" placeholder="Why is this user being suspended?" />
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (days, leave empty for permanent)</label>
                    <input type="number" value={suspendDuration} onChange={e => setSuspendDuration(e.target.value)} min={1} max={365}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-4 focus:ring-primary-600 focus:border-primary-600" placeholder="e.g. 30" />
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                        <button onClick={handleSuspend} disabled={suspendReason.length < 5 || actionLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />} Suspend
                        </button>
                    </div>
                </>)}
            </ActionModal>

            <ActionModal open={modal === "ban"} onClose={() => setModal(null)} title="Ban User" icon={<Ban className="h-5 w-5" />} danger>
                {actionResult ? <p className={cn("text-sm font-medium", actionResult.success ? "text-green-600" : "text-red-600")}>{actionResult.message}</p> : (<>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2"><AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> This action will permanently ban the user and revoke all access. This can be reversed later.</p>
                    </div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason *</label>
                    <textarea value={banReason} onChange={e => setBanReason(e.target.value)} rows={3}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-4 focus:ring-primary-600 focus:border-primary-600" placeholder="Reason for banning this user..." />
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                        <button onClick={handleBan} disabled={banReason.length < 5 || actionLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />} Ban User
                        </button>
                    </div>
                </>)}
            </ActionModal>

            <ActionModal open={modal === "verify"} onClose={() => setModal(null)} title="Verify Email" icon={<ShieldCheck className="h-5 w-5" />}>
                {actionResult ? <p className={cn("text-sm font-medium", actionResult.success ? "text-green-600" : "text-red-600")}>{actionResult.message}</p> : (<>
                    <p className="text-sm text-slate-500 mb-4">This will manually verify <strong>{user.email}</strong>. The user will be able to access all features.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                        <button onClick={handleVerify} disabled={actionLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />} Verify
                        </button>
                    </div>
                </>)}
            </ActionModal>

            <ActionModal open={modal === "delete"} onClose={() => setModal(null)} title="Delete User" icon={<Trash2 className="h-5 w-5" />} danger>
                {actionResult ? <p className={cn("text-sm font-medium", actionResult.success ? "text-green-600" : "text-red-600")}>{actionResult.message}</p> : (<>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2"><AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> This will anonymize all personal data (GDPR compliant). This action cannot be undone.</p>
                    </div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type <strong>DELETE</strong> to confirm</label>
                    <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-4 font-mono focus:ring-red-600 focus:border-red-600" placeholder="DELETE" />
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                        <button onClick={handleDelete} disabled={deleteConfirm !== "DELETE" || actionLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />} Delete
                        </button>
                    </div>
                </>)}
            </ActionModal>

            <ActionModal open={modal === "resetPassword"} onClose={() => setModal(null)} title="Reset Password" icon={<Lock className="h-5 w-5" />}>
                {actionResult ? <p className={cn("text-sm font-medium", actionResult.success ? "text-green-600" : "text-red-600")}>{actionResult.message}</p> : (<>
                    <p className="text-sm text-slate-500 mb-4">This will send a password reset email to <strong>{user.email}</strong>. All existing sessions will be invalidated.</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                        <button onClick={handleResetPassword} disabled={actionLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />} Send Reset Email
                        </button>
                    </div>
                </>)}
            </ActionModal>

            <ActionModal open={modal === "impersonate"} onClose={() => setModal(null)} title="Impersonate User" icon={<UserCog className="h-5 w-5" />}>
                {actionResult ? <p className={cn("text-sm font-medium", actionResult.success ? "text-green-600" : "text-red-600")}>{actionResult.message}</p> : (<>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                        <p className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2"><AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> This action is logged in the audit trail. You will see the platform as this user sees it.</p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                        <button onClick={handleImpersonate} disabled={actionLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />} Start Impersonation
                        </button>
                    </div>
                </>)}
            </ActionModal>
        </div>
    );
}

// --- Tab Components ---

function OverviewTab({ user }: { user: AdminUserDetail }) {
    const stats = [
        { label: "Total Events", value: user.created_events.length, icon: <Calendar className="h-5 w-5" />, color: "blue" },
        { label: "Attended", value: user.attended_events.length, icon: <TicketIcon className="h-5 w-5" />, color: "purple" },
        { label: "Reviews Given", value: user.reviews_given.length, icon: <Star className="h-5 w-5" />, color: "green" },
        { label: "Reviews Received", value: user.reviews_received.length, icon: <Activity className="h-5 w-5" />, color: "orange" },
    ];
    const colorMap: Record<string, string> = {
        blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
        purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
        green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
        orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-8">
                {/* Contact Info */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary-600" /> Contact Information
                    </h3>
                    <div className="space-y-3">
                        <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
                        {user.phone && <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone} />}
                        {user.location && <InfoRow icon={<MapPin className="h-4 w-4" />} label="Location" value={user.location} />}
                        {user.bio && <InfoRow icon={<StickyNote className="h-4 w-4" />} label="Bio" value={user.bio} />}
                    </div>
                </div>
                {/* Security Snapshot */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary-600" /> Security Snapshot
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">Last Login</span>
                            <span className="font-medium text-slate-900 dark:text-white">
                                {user.last_login_at ? formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true }) : "Never"}
                            </span>
                        </div>
                        {user.login_history[0] && (
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-500">Last IP</span>
                                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{user.login_history[0].ip_address}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">2FA Status</span>
                            {user.has_2fa ? (
                                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium text-xs bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Enabled
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-slate-500 font-medium text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Disabled</span>
                            )}
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">Email Verified</span>
                            {user.email_verified
                                ? <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</span>
                                : <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium"><XCircle className="h-3.5 w-3.5" /> Unverified</span>}
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-slate-500">Account Active</span>
                            {user.is_active
                                ? <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Active</span>
                                : <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium"><XCircle className="h-3.5 w-3.5" /> Inactive</span>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2 space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map(s => (
                        <div key={s.label} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className={cn("p-2 rounded-lg w-fit mb-2", colorMap[s.color])}>{s.icon}</div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                            <p className="text-xs text-slate-500">{s.label}</p>
                        </div>
                    ))}
                </div>
                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary-600" /> Recent Activity
                    </h3>
                    {user.login_history.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>
                    ) : (
                        <div className="relative pl-4 border-l border-slate-200 dark:border-slate-800 space-y-6">
                            {user.login_history.slice(0, 6).map((lh, i) => (
                                <div key={i} className="relative">
                                    <div className={cn("absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 shadow-sm",
                                        lh.success ? (i === 0 ? "bg-primary-600" : "bg-slate-300 dark:bg-slate-600") : "bg-red-500")} />
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                        <p className="text-sm text-slate-900 dark:text-white font-medium">
                                            {lh.success ? "Successful login" : `Failed login${lh.failure_reason ? `: ${lh.failure_reason}` : ""}`}
                                        </p>
                                        <span className="text-xs text-slate-400 whitespace-nowrap">{formatDistanceToNow(new Date(lh.timestamp), { addSuffix: true })}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">IP: {lh.ip_address}{lh.location ? ` · ${lh.location}` : ""}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary-600/10 flex items-center justify-center text-primary-600 shrink-0">{icon}</div>
            <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{value}</p>
            </div>
        </div>
    );
}

function EventsTab({ user }: { user: AdminUserDetail }) {
    return (
        <div className="space-y-8">
            <TableCard title="Events Organized" icon={<Calendar className="h-5 w-5 text-primary-600" />}
                headers={["Event Name", "Status", "Date", "Created"]}
                empty={user.created_events.length === 0} emptyMsg="No events organized">
                {user.created_events.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{e.title}</td>
                        <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded text-xs font-medium capitalize", EVENT_STATUS[e.status || "draft"])}>{e.status || "N/A"}</span></td>
                        <td className="px-4 py-3 text-slate-500 text-sm">{e.start_date ? format(new Date(e.start_date), "MMM d, yyyy") : "—"}</td>
                        <td className="px-4 py-3 text-slate-500 text-sm">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</td>
                    </tr>
                ))}
            </TableCard>
            <TableCard title="Events Attended" icon={<TicketIcon className="h-5 w-5 text-primary-600" />}
                headers={["Event Name", "Status", "Registered"]}
                empty={user.attended_events.length === 0} emptyMsg="No events attended">
                {user.attended_events.map((e, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{e.title}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-medium capitalize bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">{e.status}</span></td>
                        <td className="px-4 py-3 text-slate-500 text-sm">{formatDistanceToNow(new Date(e.registered_at), { addSuffix: true })}</td>
                    </tr>
                ))}
            </TableCard>
        </div>
    );
}

function TicketsTab() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 shadow-sm text-center">
            <TicketIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Ticket System Coming Soon</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">The ticketing module is currently under development. Ticket purchases and transaction history will appear here once available.</p>
        </div>
    );
}

function ActivityTab({ user }: { user: AdminUserDetail }) {
    type TimelineItem = { ts: string; type: "login" | "event_created" | "event_attended" | "review"; label: string; detail?: string; success?: boolean; };
    const items: TimelineItem[] = [
        ...user.login_history.map(l => ({ ts: l.timestamp, type: "login" as const, label: l.success ? "Logged in" : "Failed login attempt", detail: `IP: ${l.ip_address}${l.location ? " · " + l.location : ""}`, success: l.success })),
        ...user.created_events.map(e => ({ ts: e.created_at, type: "event_created" as const, label: `Created event: ${e.title}`, detail: e.status ?? undefined })),
        ...user.attended_events.map(e => ({ ts: e.registered_at, type: "event_attended" as const, label: `Registered for: ${e.title}`, detail: e.status })),
        ...user.reviews_given.map(r => ({ ts: r.created_at, type: "review" as const, label: `Reviewed: ${r.event_title}`, detail: `Rating: ${r.rating}/5` })),
    ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

    const iconMap = { login: <Fingerprint className="h-4 w-4" />, event_created: <Calendar className="h-4 w-4" />, event_attended: <TicketIcon className="h-4 w-4" />, review: <Star className="h-4 w-4" /> };
    const colorMap = { login: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300", event_created: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300", event_attended: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300", review: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300" };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary-600" /> Full Activity Timeline
            </h3>
            {items.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-12">No activity recorded</p>
            ) : (
                <div className="relative pl-6 border-l border-slate-200 dark:border-slate-700 space-y-5">
                    {items.map((item, i) => (
                        <div key={i} className="relative flex items-start gap-4">
                            <div className={cn("absolute -left-[33px] p-1.5 rounded-full border-2 border-white dark:border-slate-900", item.type === "login" && !item.success ? "bg-red-100 text-red-600 dark:bg-red-900/30" : colorMap[item.type])}>
                                {item.type === "login" && !item.success ? <XCircle className="h-4 w-4" /> : iconMap[item.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.label}</p>
                                    <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{formatDistanceToNow(new Date(item.ts), { addSuffix: true })}</span>
                                </div>
                                {item.detail && <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SecurityTab({ user, onRefresh }: { user: AdminUserDetail; onRefresh: () => void }) {
    const failedLogins = user.login_history.filter(l => !l.success);
    const recentFails = user.login_history.slice(0, 10).filter(l => !l.success).length;
    const uniqueIPs = new Set(user.login_history.map(l => l.ip_address)).size;
    const [revokingId, setRevokingId] = React.useState<string | null>(null);
    const [revokingAll, setRevokingAll] = React.useState(false);

    const handleRevokeSession = async (sessionId: string) => {
        setRevokingId(sessionId);
        try { await adminService.revokeSession(user.id, sessionId); onRefresh(); }
        catch (e) { console.error(e); }
        finally { setRevokingId(null); }
    };
    const handleRevokeAll = async () => {
        setRevokingAll(true);
        try { await adminService.revokeAllSessions(user.id); onRefresh(); }
        catch (e) { console.error(e); }
        finally { setRevokingAll(false); }
    };

    const getDeviceIcon = (info: string | null) => {
        const s = (info || "").toLowerCase();
        if (s.includes("iphone") || s.includes("android") || s.includes("mobile")) return <Smartphone className="h-5 w-5" />;
        return <Monitor className="h-5 w-5" />;
    };

    const suspiciousFlags = [
        ...(recentFails >= 3 ? [{ title: "Multiple Failed Logins", desc: `${recentFails} failed login attempt${recentFails !== 1 ? "s" : ""} detected in recent history.`, time: "Recent" }] : []),
        ...(!user.email_verified ? [{ title: "Unverified Email", desc: "User's email address has not been verified.", time: "" }] : []),
        ...(uniqueIPs > 8 ? [{ title: "Unusual IP Diversity", desc: `Logins detected from ${uniqueIPs} different IP addresses.`, time: "" }] : []),
    ];

    return (
        <div className="space-y-6">
            {/* Top 3-card row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2FA Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h3>
                            <div className={cn("p-2 rounded-lg", user.has_2fa ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                                <Shield className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                            2FA adds an additional layer of security by requiring more than just a password to sign in.
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={cn("w-2.5 h-2.5 rounded-full", user.has_2fa ? "bg-green-500 animate-pulse" : "bg-slate-400")} />
                            <span className={cn("text-sm font-semibold", user.has_2fa ? "text-green-700 dark:text-green-400" : "text-slate-500 dark:text-slate-400")}>
                                {user.has_2fa ? "Currently Enabled" : "Not Configured"}
                            </span>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button className="w-full py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                            <Lock className="h-4 w-4" /> Reset 2FA Config
                        </button>
                    </div>
                </div>

                {/* Suspicious Activity Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-red-200 dark:border-red-900/30 p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l-xl" />
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" /> Suspicious Activity
                        </h3>
                        {suspiciousFlags.length > 0 && (
                            <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-bold px-2 py-1 rounded">
                                {suspiciousFlags.length} Flag{suspiciousFlags.length !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                    <div className="space-y-3 flex-1">
                        {suspiciousFlags.length === 0 ? (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-100 dark:border-green-900/20">
                                <CheckCircle2 className="h-4 w-4 shrink-0" /> No suspicious activity detected
                            </div>
                        ) : suspiciousFlags.map((f, i) => (
                            <div key={i} className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-red-700 dark:text-red-400">{f.title}</span>
                                    {f.time && <span className="text-[10px] text-red-500/80">{f.time}</span>}
                                </div>
                                <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 flex justify-end">
                        <button onClick={() => { }} className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1">
                            View Security Log <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Password Management Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">Password Management</h3>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Last Login</span>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {user.last_login_at ? formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true }) : "Never"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Email Verified</span>
                            {user.email_verified
                                ? <span className="flex items-center gap-1 text-xs font-medium text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</span>
                                : <span className="flex items-center gap-1 text-xs font-medium text-red-500"><XCircle className="h-3.5 w-3.5" /> Unverified</span>}
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-500 dark:text-slate-400">Account Status</span>
                            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded capitalize", user.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400")}>
                                {user.status}
                            </span>
                        </div>
                        <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <span className="font-semibold block mb-1">Sessions:</span>
                            {user.active_sessions.length} active session{user.active_sessions.length !== 1 ? "s" : ""} · {failedLogins.length} failed login attempt{failedLogins.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => { }} className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                            Send Reset Link
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom 2-column row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Login History — spans 2 cols */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Login History</h3>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                                <Download className="h-3.5 w-3.5" /> Export
                            </button>
                        </div>
                    </div>
                    {user.login_history.length === 0 ? (
                        <div className="p-12 text-center text-sm text-slate-400">No login history</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-5 py-3 whitespace-nowrap">Date & Time</th>
                                        <th className="px-5 py-3 whitespace-nowrap">Status</th>
                                        <th className="px-5 py-3 whitespace-nowrap">Location</th>
                                        <th className="px-5 py-3 whitespace-nowrap">IP Address</th>
                                        <th className="px-5 py-3 whitespace-nowrap">Device</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {user.login_history.map((lh, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="font-medium text-slate-900 dark:text-slate-200 text-sm">{format(new Date(lh.timestamp), "MMM d, yyyy")}</div>
                                                <div className="text-xs text-slate-400">{format(new Date(lh.timestamp), "h:mm a")}</div>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {lh.success
                                                    ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="h-3 w-3" /> Success</span>
                                                    : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="h-3 w-3" /> Failed</span>}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                    {lh.location || "—"}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-400">{lh.ip_address}</td>
                                            <td className="px-5 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    {lh.user_agent?.toLowerCase().includes("mobile") || lh.user_agent?.toLowerCase().includes("iphone") || lh.user_agent?.toLowerCase().includes("android")
                                                        ? <Smartphone className="h-4 w-4 text-slate-400" />
                                                        : <Monitor className="h-4 w-4 text-slate-400" />}
                                                    <span className="truncate max-w-[120px]" title={lh.user_agent || ""}>{lh.user_agent ? lh.user_agent.replace(/Mozilla\/\d+\.\d+\s*/i, "").slice(0, 30) : "—"}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Showing {user.login_history.length} records</span>
                    </div>
                </div>

                {/* Active Sessions — spans 1 col */}
                <div className="xl:col-span-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Sessions</h3>
                        <span className="bg-primary-600/10 text-primary-600 dark:text-primary-400 text-xs font-bold px-2 py-1 rounded-full">
                            {user.active_sessions.length} Active
                        </span>
                    </div>
                    <div className="p-6 space-y-5 flex-1">
                        {user.active_sessions.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">No active sessions</p>
                        ) : user.active_sessions.map((s, i) => (
                            <React.Fragment key={s.id}>
                                {i > 0 && <div className="h-px bg-slate-100 dark:bg-slate-800" />}
                                <div className="flex gap-4 items-start group">
                                    <div className="flex-shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400">
                                        {getDeviceIcon(s.device_info)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{s.device_info || "Unknown Device"}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{s.ip_address}</p>
                                            </div>
                                            {i === 0 ? (
                                                <span className="text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded uppercase tracking-wide shrink-0 ml-2">Current</span>
                                            ) : (
                                                <button onClick={() => handleRevokeSession(s.id)} disabled={revokingId === s.id}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/30 hover:bg-red-100 disabled:opacity-50 shrink-0 ml-2">
                                                    {revokingId === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Revoke"}
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1.5">
                                            Active {formatDistanceToNow(new Date(s.last_active_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={handleRevokeAll} disabled={revokingAll || user.active_sessions.length === 0}
                            className="w-full py-2.5 border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            {revokingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockOpen className="h-4 w-4" />} Sign Out All Devices
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NotesTab({ user, noteContent, setNoteContent, onAddNote, onDeleteNote, actionLoading }: {
    user: AdminUserDetail; noteContent: string; setNoteContent: (v: string) => void; onAddNote: () => void; onDeleteNote: (id: string) => void; actionLoading: boolean;
}) {
    const moderationActions: Record<string, { label: string; icon: any; color: string }> = {
        suspend_user: { label: "Account Suspended", icon: XCircle, color: "text-red-500 bg-red-500" },
        unsuspend_user: { label: "Account Reinstated", icon: CheckCircle2, color: "text-green-500 bg-green-500" },
        ban_user: { label: "Account Banned", icon: Ban, color: "text-red-700 bg-red-700" },
        verify_user: { label: "Email Verified", icon: ShieldCheck, color: "text-green-500 bg-green-500" },
        reset_password: { label: "Password Reset Sent", icon: Lock, color: "text-amber-500 bg-amber-500" },
        revoke_session: { label: "Session Revoked", icon: LogOut, color: "text-slate-500 bg-slate-500" },
        revoke_all_sessions: { label: "All Sessions Revoked", icon: ShieldBan, color: "text-red-500 bg-red-500" },
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Notes Composer & Timeline (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
                {/* New Note Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 transition-all duration-200 hover:shadow-md">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <PenTool className="h-5 w-5 text-primary-600" /> New Note
                    </h3>
                    <div className="space-y-4">
                        <div className="relative group">
                            {/* Fake Rich Text Toolbar */}
                            <div className="absolute top-0 left-0 w-full flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-t-lg z-10">
                                <button className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all border border-transparent hover:border-slate-200" title="Bold"><Bold className="h-4 w-4" /></button>
                                <button className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all border border-transparent hover:border-slate-200" title="Italic"><Italic className="h-4 w-4" /></button>
                                <button className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all border border-transparent hover:border-slate-200" title="List"><List className="h-4 w-4" /></button>
                                <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1" />
                                <button className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all border border-transparent hover:border-slate-200" title="Attachment"><Paperclip className="h-4 w-4" /></button>
                            </div>
                            <textarea
                                value={noteContent}
                                onChange={e => setNoteContent(e.target.value)}
                                className="w-full min-h-[140px] pt-14 p-4 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 focus:border-primary-600 focus:ring-primary-600/20 text-sm placeholder:text-slate-400 group-hover:border-slate-300 transition-all"
                                placeholder="Write a confidential internal note about this user... Only staff can see this."
                            />
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-100 dark:border-amber-900/10">
                                <Lock className="h-3.5 w-3.5" /> Internal Use Only
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setNoteContent("")}
                                    className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={onAddNote}
                                    disabled={!noteContent.trim() || actionLoading}
                                    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg shadow-sm shadow-primary-600/10 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save Note
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Note History */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <StickyNote className="h-4 w-4 text-slate-400" /> Note History
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {user.admin_notes.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 text-sm">No notes have been recorded for this user.</div>
                        ) : user.admin_notes.map((note, i) => {
                            const isAdmin = !note.admin_email?.includes("system");
                            return (
                                <div key={note.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group">
                                    <div className="flex gap-4">
                                        <div className="shrink-0">
                                            <div className={cn("size-10 rounded-full flex items-center justify-center", isAdmin ? "bg-slate-100 dark:bg-slate-800" : "bg-blue-50 dark:bg-blue-900/20")}>
                                                {isAdmin ? <User className="h-5 w-5 text-slate-500" /> : <Bot className="h-5 w-5 text-primary-500" />}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {note.admin_email?.split("@")[0] || "System"}
                                                        <span className="text-xs font-normal text-slate-400 ml-2">{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                                                    </p>
                                                    <p className={cn("text-[10px] font-bold uppercase tracking-wider", isAdmin ? "text-primary-600" : "text-slate-400")}>
                                                        {isAdmin ? "Administrator" : "Automated System"}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => onDeleteNote(note.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all" title="Delete note">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 italic">
                                                "{note.content}"
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right Column: Moderation History & Actions */}
            <div className="lg:col-span-1 space-y-6">
                {/* Moderation History Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Gavel className="h-5 w-5 text-red-500" /> Moderation History
                        </h3>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
                            {user.moderation_history?.length || 0} Records
                        </span>
                    </div>

                    <div className="relative pl-2 space-y-8 before:absolute before:inset-0 before:ml-1 before:h-full before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800 before:content-['']">
                        {(user.moderation_history || []).length === 0 ? (
                            <p className="text-xs text-slate-400 italic text-center py-4">No moderation logs yet</p>
                        ) : user.moderation_history.slice(0, 5).map((log, idx) => {
                            const config = moderationActions[log.action] || { label: log.action.replace(/_/g, " "), icon: Activity, color: "text-slate-400 bg-slate-400" };
                            return (
                                <div key={log.id} className="relative pl-7 group">
                                    <span className={cn("absolute left-0 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-white dark:border-slate-900 ring-4 ring-white dark:ring-slate-900 transition-transform group-hover:scale-125", config.color)} />
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] uppercase font-bold text-slate-400">{format(new Date(log.created_at), "MMM d, yyyy")}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{config.label}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {log.admin_email?.split("@")[0]} performed this action
                                        </p>
                                        {log.changes?.reason && (
                                            <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-800">
                                                <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">"Reason: {log.changes.reason}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button className="w-full mt-8 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]">
                        View Full System Log
                    </button>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary-600" /> Quick Actions
                    </h3>
                    <div className="space-y-1">
                        <button onClick={() => {}} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group transition-all">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-primary-600 transition-colors">Reset Password</span>
                            <RotateCcw className="h-4 w-4 text-slate-400 group-hover:text-primary-600" />
                        </button>
                        <button onClick={() => {}} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group transition-all">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-primary-600 transition-colors">Send Email Notice</span>
                            <Mail className="h-4 w-4 text-slate-400 group-hover:text-primary-600" />
                        </button>
                        <button onClick={() => {}} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center justify-between group transition-all">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-red-600 transition-colors">Force Logout</span>
                            <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TableCard({ title, icon, headers, children, empty, emptyMsg }: {
    title: string; icon: React.ReactNode; headers: string[]; children: React.ReactNode; empty: boolean; emptyMsg: string;
}) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">{icon} {title}</h3>
            </div>
            {empty ? (
                <div className="p-12 text-center"><p className="text-sm text-slate-400">{emptyMsg}</p></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                            <tr>{headers.map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
