"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Shield, Mail, Phone, Globe, MapPin, Calendar, Clock,
    Fingerprint, Lock, LockOpen, Ban, ShieldCheck, ShieldBan, Trash2,
    Eye, EyeOff, UserCog, Send, X, Loader2, ChevronRight,
    MoreVertical, AlertTriangle, Download, StickyNote, Plus,
    Monitor, Smartphone, Activity, Star, ExternalLink,
    CheckCircle2, XCircle, TicketIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminService, AdminUserDetail } from "@/lib/admin-service";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

type TabId = "overview" | "events" | "tickets" | "security" | "notes";

const TABS: { id: TabId; label: string; countKey?: keyof AdminUserDetail }[] = [
    { id: "overview", label: "Overview" },
    { id: "events", label: "Events", countKey: "created_events" },
    { id: "tickets", label: "Tickets" },
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
                {activeTab === "security" && <SecurityTab user={user} />}
                {activeTab === "notes" && <NotesTab user={user} noteContent={noteContent} setNoteContent={setNoteContent} onAddNote={handleAddNote} actionLoading={actionLoading} />}
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
                        <div className="flex justify-between items-center py-2">
                            <span className="text-slate-500">2FA Status</span>
                            {user.has_2fa ? (
                                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium text-xs bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Enabled
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-slate-500 font-medium text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Disabled</span>
                            )}
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

function SecurityTab({ user }: { user: AdminUserDetail }) {
    return (
        <div className="space-y-8">
            {/* 2FA Status */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Shield className="h-5 w-5 text-primary-600" /> Two-Factor Authentication</h3>
                <div className="flex items-center gap-3">
                    {user.has_2fa ? (<><CheckCircle2 className="h-6 w-6 text-green-500" /><div><p className="font-medium text-green-700 dark:text-green-400">Enabled</p><p className="text-xs text-slate-500">2FA is active on this account</p></div></>)
                        : (<><XCircle className="h-6 w-6 text-slate-400" /><div><p className="font-medium text-slate-600 dark:text-slate-400">Disabled</p><p className="text-xs text-slate-500">2FA has not been set up</p></div></>)}
                </div>
            </div>
            {/* Login History */}
            <TableCard title="Login History" icon={<Clock className="h-5 w-5 text-primary-600" />}
                headers={["IP Address", "Location", "Result", "Time"]}
                empty={user.login_history.length === 0} emptyMsg="No login history">
                {user.login_history.map((lh, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{lh.ip_address}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{lh.location || "—"}</td>
                        <td className="px-4 py-3">
                            {lh.success
                                ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded"><CheckCircle2 className="h-3 w-3" /> Success</span>
                                : <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 px-2 py-0.5 rounded"><XCircle className="h-3 w-3" /> Failed</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{formatDistanceToNow(new Date(lh.timestamp), { addSuffix: true })}</td>
                    </tr>
                ))}
            </TableCard>
            {/* Active Sessions */}
            <TableCard title="Active Sessions" icon={<Monitor className="h-5 w-5 text-primary-600" />}
                headers={["Device", "IP", "Last Active", "Expires"]}
                empty={user.active_sessions.length === 0} emptyMsg="No active sessions">
                {user.active_sessions.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{s.device_info || "Unknown device"}</td>
                        <td className="px-4 py-3 font-mono text-xs">{s.ip_address}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{formatDistanceToNow(new Date(s.last_active_at), { addSuffix: true })}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{format(new Date(s.expires_at), "MMM d, HH:mm")}</td>
                    </tr>
                ))}
            </TableCard>
        </div>
    );
}

function NotesTab({ user, noteContent, setNoteContent, onAddNote, actionLoading }: {
    user: AdminUserDetail; noteContent: string; setNoteContent: (v: string) => void; onAddNote: () => void; actionLoading: boolean;
}) {
    return (
        <div className="space-y-6">
            {/* Add Note */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Plus className="h-5 w-5 text-primary-600" /> Add Note</h3>
                <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white mb-3 focus:ring-primary-600 focus:border-primary-600"
                    placeholder="Write an internal note about this user..." />
                <button onClick={onAddNote} disabled={!noteContent.trim() || actionLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Add Note
                </button>
            </div>
            {/* Notes List */}
            {user.admin_notes.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 shadow-sm text-center">
                    <StickyNote className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-sm text-slate-400">No admin notes yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {user.admin_notes.map(note => (
                        <div key={note.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-primary-600">{note.admin_email || "Admin"}</span>
                                <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{note.content}</p>
                        </div>
                    ))}
                </div>
            )}
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
