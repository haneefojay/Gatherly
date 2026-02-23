"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    Search,
    Filter,
    Download,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    MoreVertical,
    CheckCircle2,
    Circle,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Eye,
    Edit,
    ShieldBan,
    ShieldCheck,
    Trash2,
    X,
    Users,
    Loader2,
    MapPin,
    Clock,
    Bookmark,
    BookmarkPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminService, AdminUserListItem, UserListParams } from "@/lib/admin-service";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

// --- Search highlighting helper ---
const HighlightText = ({ text, query }: { text: string; query: string }) => {
    if (!query || !text) return <>{text}</>;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/30 text-inherit rounded-sm px-0.5">{part}</mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
};

// --- localStorage helpers ---
const SEARCH_HISTORY_KEY = "admin_user_search_history";
const SAVED_SEARCHES_KEY = "admin_user_saved_searches";
const MAX_HISTORY = 10;

interface SavedSearch {
    name: string;
    search: string;
    roleFilter?: string;
    statusFilter?: string;
    verifiedFilter?: boolean;
    dateFrom: string;
    dateTo: string;
    lastLoginAfter: string;
    lastLoginBefore: string;
    locationFilter: string;
}

function getSearchHistory(): string[] {
    try { return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]"); } catch { return []; }
}
function addSearchHistory(term: string) {
    if (!term.trim()) return;
    const history = getSearchHistory().filter(h => h !== term);
    history.unshift(term);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}
function clearSearchHistory() {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
}
function getSavedSearches(): SavedSearch[] {
    try { return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || "[]"); } catch { return []; }
}
function addSavedSearch(s: SavedSearch) {
    const saved = getSavedSearches().filter(x => x.name !== s.name);
    saved.unshift(s);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(saved));
}
function removeSavedSearch(name: string) {
    const saved = getSavedSearches().filter(x => x.name !== name);
    localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(saved));
}

const ROLE_STYLES: Record<string, string> = {
    admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    organizer: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    user: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const STATUS_DOT: Record<string, string> = {
    active: "bg-emerald-500",
    suspended: "bg-amber-400",
    banned: "bg-rose-500",
    pending: "bg-amber-400",
    deleted: "bg-slate-400",
};

const PAGE_SIZES = [10, 20, 50, 100];

export default function AdminUsersPage() {
    const [dropdownDirection, setDropdownDirection] = useState<Record<string, 'up' | 'down'>>({});
    const [users, setUsers] = useState<AdminUserListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string | undefined>();
    const [statusFilter, setStatusFilter] = useState<string | undefined>();
    const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>();
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [lastLoginAfter, setLastLoginAfter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [lastLoginBefore, setLastLoginBefore] = useState("");

    // Sorting
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    // Selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // UI state
    const [showFilters, setShowFilters] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [bulkAction, setBulkAction] = useState("");
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [showSavedSearches, setShowSavedSearches] = useState(false);
    const [saveSearchName, setSaveSearchName] = useState("");
    const [showSaveInput, setShowSaveInput] = useState(false);

    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchDropdownRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLTableDataCellElement>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params: UserListParams = {
                page,
                page_size: pageSize,
                sort_by: sortBy,
                sort_order: sortOrder,
                role: roleFilter,
                status: statusFilter,
                email_verified: verifiedFilter,
                search: search || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                last_login_after: lastLoginAfter || undefined,
                last_login_before: lastLoginBefore || undefined,
                location: locationFilter || undefined,
            };
            const res = await adminService.listUsers(params);
            setUsers(res.users);
            setTotal(res.total);
            setTotalPages(res.total_pages);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, sortBy, sortOrder, roleFilter, statusFilter, verifiedFilter, search, dateFrom, dateTo, lastLoginAfter, lastLoginBefore, locationFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Load search history & saved searches on mount
    useEffect(() => {
        setSearchHistory(getSearchHistory());
        setSavedSearches(getSavedSearches());
    }, []);

    // Close search dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
                setShowSearchDropdown(false);
                setShowSavedSearches(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Debounced search
    const handleSearchChange = (val: string) => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setSearch(val);
            setPage(1);
            if (val.trim()) {
                addSearchHistory(val.trim());
                setSearchHistory(getSearchHistory());
            }
        }, 400);
    };

    const applySearchTerm = (term: string) => {
        setSearch(term);
        if (searchInputRef.current) searchInputRef.current.value = term;
        setPage(1);
        setShowSearchDropdown(false);
    };

    const handleSaveSearch = () => {
        if (!saveSearchName.trim()) return;
        const s: SavedSearch = {
            name: saveSearchName.trim(),
            search,
            roleFilter,
            statusFilter,
            verifiedFilter,
            dateFrom,
            dateTo,
            lastLoginAfter,
            lastLoginBefore,
            locationFilter,
        };
        addSavedSearch(s);
        setSavedSearches(getSavedSearches());
        setSaveSearchName("");
        setShowSaveInput(false);
    };

    const applySavedSearch = (s: SavedSearch) => {
        setSearch(s.search);
        if (searchInputRef.current) searchInputRef.current.value = s.search;
        setRoleFilter(s.roleFilter);
        setStatusFilter(s.statusFilter);
        setVerifiedFilter(s.verifiedFilter);
        setDateFrom(s.dateFrom);
        setDateTo(s.dateTo);
        setLastLoginAfter(s.lastLoginAfter);
        setLastLoginBefore(s.lastLoginBefore);
        setLocationFilter(s.locationFilter);
        setPage(1);
        setShowSavedSearches(false);
    };

    const handleDeleteSavedSearch = (name: string) => {
        removeSavedSearch(name);
        setSavedSearches(getSavedSearches());
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Sort handler
    const handleSort = (col: string) => {
        if (sortBy === col) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(col);
            setSortOrder("asc");
        }
        setPage(1);
    };

    // Selection handlers
    const toggleSelectAll = () => {
        if (selectedIds.size === users.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(users.map(u => u.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    // Reset filters
    const resetFilters = () => {
        setRoleFilter(undefined);
        setStatusFilter(undefined);
        setVerifiedFilter(undefined);
        setDateFrom("");
        setDateTo("");
        setLastLoginAfter("");
        setLastLoginBefore("");
        setLocationFilter("");
        setSearch("");
        if (searchInputRef.current) searchInputRef.current.value = "";
        setPage(1);
    };

    const hasActiveFilters = search || roleFilter || statusFilter || verifiedFilter !== undefined || dateFrom || dateTo || lastLoginAfter || lastLoginBefore || locationFilter;

    // Bulk action handler
    const handleBulkAction = async () => {
        if (!bulkAction || selectedIds.size === 0) return;
        try {
            await adminService.bulkAction(bulkAction, Array.from(selectedIds));
            setBulkAction("");
            setSelectedIds(new Set());
            fetchUsers();
        } catch (err) {
            console.error("Bulk action failed:", err);
        }
    };

    // Row action handlers
    const handleVerifyUser = async (userId: string) => {
        try {
            await adminService.verifyUser(userId);
            setOpenDropdown(null);
            fetchUsers();
        } catch (err) {
            console.error("Verify user failed:", err);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure? This will anonymize the user's data.")) return;
        try {
            await adminService.deleteUser(userId);
            setOpenDropdown(null);
            fetchUsers();
        } catch (err) {
            console.error("Delete user failed:", err);
        }
    };

    // Export CSV
    const handleExport = () => {
        const header = "Name,Email,Role,Status,Verified,Last Login,Registered\n";
        const rows = users.map(u =>
            `"${u.full_name}","${u.email}","${u.role}","${u.status}","${u.email_verified}","${u.last_login_at || 'Never'}","${u.created_at}"`
        ).join("\n");
        const blob = new Blob([header + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const SortIcon = ({ col }: { col: string }) => {
        if (sortBy !== col) return <ArrowUpDown className="h-3.5 w-3.5 text-slate-300 ml-1" />;
        return sortOrder === "asc"
            ? <ArrowUp className="h-3.5 w-3.5 text-primary-600 ml-1" />
            : <ArrowDown className="h-3.5 w-3.5 text-primary-600 ml-1" />;
    };

    const fromIdx = (page - 1) * pageSize + 1;
    const toIdx = Math.min(page * pageSize, total);

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] -mx-8 -my-0">
            {/* Top Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary-600/10 flex items-center justify-center text-primary-600">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h1>
                            <p className="text-sm text-slate-500">Manage access and roles for event participants</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group" ref={searchDropdownRef}>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 group-focus-within:text-primary-600 transition-colors z-10" />
                            <input
                                ref={searchInputRef}
                                className="pl-10 pr-4 py-2 w-72 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none transition-all text-sm placeholder-slate-400"
                                placeholder="Search by name, email or ID..."
                                type="text"
                                defaultValue={search}
                                onChange={e => handleSearchChange(e.target.value)}
                                onFocus={() => setShowSearchDropdown(true)}
                            />
                            {/* Search history dropdown */}
                            {showSearchDropdown && searchHistory.length > 0 && !search && (
                                <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
                                    <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" /> Recent Searches
                                        </span>
                                        <button
                                            onClick={() => { clearSearchHistory(); setSearchHistory([]); }}
                                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    {searchHistory.map((term, i) => (
                                        <button
                                            key={i}
                                            onClick={() => applySearchTerm(term)}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 w-full text-left transition-colors"
                                        >
                                            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{term}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Saved searches toggle */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSavedSearches(!showSavedSearches)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                                    savedSearches.length > 0
                                        ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                                )}
                            >
                                <Bookmark className="h-4 w-4" />
                                {savedSearches.length > 0 && <span>{savedSearches.length}</span>}
                            </button>
                            {showSavedSearches && (
                                <div className="absolute top-full right-0 mt-1 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
                                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Bookmark className="h-3 w-3" /> Saved Searches
                                        </span>
                                    </div>
                                    {savedSearches.length === 0 ? (
                                        <p className="px-3 py-4 text-sm text-slate-400 text-center">No saved searches yet</p>
                                    ) : (
                                        savedSearches.map((s) => (
                                            <div key={s.name} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                                                <button
                                                    onClick={() => applySavedSearch(s)}
                                                    className="flex-1 min-w-0 text-left"
                                                >
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{s.name}</p>
                                                    <p className="text-xs text-slate-400 truncate">
                                                        {[s.search && `"${s.search}"`, s.roleFilter, s.statusFilter, s.locationFilter].filter(Boolean).join(" · ") || "All filters"}
                                                    </p>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSavedSearch(s.name)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Save current search button */}
                        {hasActiveFilters && (
                            <div className="relative">
                                {showSaveInput ? (
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            className="px-3 py-2 w-40 rounded-lg border border-primary-300 dark:border-primary-700 bg-white dark:bg-slate-800 text-sm placeholder-slate-400 outline-none focus:ring-1 focus:ring-primary-600"
                                            placeholder="Search name..."
                                            value={saveSearchName}
                                            onChange={e => setSaveSearchName(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && handleSaveSearch()}
                                            autoFocus
                                        />
                                        <button onClick={handleSaveSearch} className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                                            <BookmarkPlus className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => { setShowSaveInput(false); setSaveSearchName(""); }} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowSaveInput(true)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:border-primary-400 hover:text-primary-600 transition-all"
                                    >
                                        <BookmarkPlus className="h-4 w-4" /> Save
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Filter Sidebar */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 288, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto shrink-0"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-primary-600" />
                                    Filters
                                </h3>
                                <button onClick={resetFilters} className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">
                                    Reset All
                                </button>
                            </div>

                            <div className="p-6 space-y-7 flex-1">
                                {/* Role Filter */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">User Role</h4>
                                    <div className="space-y-2.5">
                                        {[
                                            { value: "admin", label: "Administrator" },
                                            { value: "organizer", label: "Organizer" },
                                            { value: "user", label: "Attendee" },
                                        ].map(r => (
                                            <label key={r.value} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    checked={roleFilter === r.value}
                                                    onChange={() => { setRoleFilter(roleFilter === r.value ? undefined : r.value); setPage(1); }}
                                                    className="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-600 focus:ring-offset-0"
                                                />
                                                <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{r.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Status</h4>
                                    <div className="space-y-2.5">
                                        {["active", "suspended", "banned", "pending"].map(s => (
                                            <label key={s} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    checked={statusFilter === s}
                                                    onChange={() => { setStatusFilter(statusFilter === s ? undefined : s); setPage(1); }}
                                                    className="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-600 focus:ring-offset-0"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("w-2 h-2 rounded-full", STATUS_DOT[s])}></span>
                                                    <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors capitalize">{s}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Verified Filter */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Email Verified</h4>
                                    <div className="space-y-2.5">
                                        {[
                                            { value: true, label: "Verified" },
                                            { value: false, label: "Not Verified" },
                                        ].map(v => (
                                            <label key={String(v.value)} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="verified"
                                                    checked={verifiedFilter === v.value}
                                                    onChange={() => { setVerifiedFilter(verifiedFilter === v.value ? undefined : v.value); setPage(1); }}
                                                    className="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-600 focus:ring-offset-0"
                                                />
                                                <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{v.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Registration Date */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Registration Date</h4>
                                    <div className="grid grid-cols-1 gap-2.5">
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-medium">From</span>
                                            <input
                                                type="date"
                                                value={dateFrom}
                                                onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                                                className="w-full pl-12 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 focus:border-primary-600 focus:ring-primary-600"
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-medium">To</span>
                                            <input
                                                type="date"
                                                value={dateTo}
                                                onChange={e => { setDateTo(e.target.value); setPage(1); }}
                                                className="w-full pl-12 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 focus:border-primary-600 focus:ring-primary-600"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Last Login Date */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Last Login</h4>
                                    <div className="grid grid-cols-1 gap-2.5">
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-medium">After</span>
                                            <input
                                                type="date"
                                                value={lastLoginAfter}
                                                onChange={e => { setLastLoginAfter(e.target.value); setPage(1); }}
                                                className="w-full pl-12 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 focus:border-primary-600 focus:ring-primary-600"
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-medium">Before</span>
                                            <input
                                                type="date"
                                                value={lastLoginBefore}
                                                onChange={e => { setLastLoginBefore(e.target.value); setPage(1); }}
                                                className="w-full pl-12 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 focus:border-primary-600 focus:ring-primary-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Location Filter */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Location</h4>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            value={locationFilter}
                                            onChange={e => { setLocationFilter(e.target.value); setPage(1); }}
                                            placeholder="Filter by city or country..."
                                            className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 focus:border-primary-600 focus:ring-primary-600 placeholder-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Table Section */}
                <section className="flex-1 overflow-hidden flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
                    {/* Action Toolbar */}
                    <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                                    showFilters
                                        ? "bg-primary-600/5 border-primary-600/20 text-primary-600"
                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                )}
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                            </button>
                            <span className="text-sm font-medium text-slate-500">
                                Showing <span className="text-slate-900 dark:text-white font-bold">{total > 0 ? `${fromIdx}-${toIdx}` : "0"}</span> of <span className="text-slate-900 dark:text-white font-bold">{total.toLocaleString()}</span> users
                            </span>
                            {selectedIds.size > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-600/10 text-primary-600">
                                    {selectedIds.size} selected
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Bulk Actions */}
                            {selectedIds.size > 0 && (
                                <div className="flex items-center gap-2">
                                    <select
                                        value={bulkAction}
                                        onChange={e => setBulkAction(e.target.value)}
                                        className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-600/20 cursor-pointer transition-colors"
                                    >
                                        <option value="">Bulk Actions</option>
                                        <option value="suspend">Suspend Selected</option>
                                        <option value="verify">Verify Selected</option>
                                        <option value="export">Export Selected</option>
                                    </select>
                                    {bulkAction && (
                                        <button
                                            onClick={handleBulkAction}
                                            className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                                        >
                                            Apply
                                        </button>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all"
                            >
                                <Download className="h-4 w-4 text-slate-500" />
                                Export CSV
                            </button>

                            {/* Items per page */}
                            <select
                                value={pageSize}
                                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                                className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-600/20 cursor-pointer transition-colors"
                            >
                                {PAGE_SIZES.map(s => (
                                    <option key={s} value={s}>{s} per page</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto px-6 pb-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-visible relative">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                                        <th className="p-4 w-12">
                                            <input
                                                type="checkbox"
                                                checked={users.length > 0 && selectedIds.size === users.length}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-600 focus:ring-offset-0"
                                            />
                                        </th>
                                        <th className="p-4 cursor-pointer hover:text-primary-600 transition-colors" onClick={() => handleSort("full_name")}>
                                            <div className="flex items-center">User <SortIcon col="full_name" /></div>
                                        </th>
                                        <th className="p-4 cursor-pointer hover:text-primary-600 transition-colors" onClick={() => handleSort("email")}>
                                            <div className="flex items-center">Email <SortIcon col="email" /></div>
                                        </th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-center">Verified</th>
                                        <th className="p-4 text-right cursor-pointer hover:text-primary-600 transition-colors" onClick={() => handleSort("last_login_at")}>
                                            <div className="flex items-center justify-end">Last Login <SortIcon col="last_login_at" /></div>
                                        </th>
                                        <th className="p-4 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-600 dark:text-slate-300">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="p-16 text-center">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="p-16 text-center text-slate-400">
                                                <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                                <p className="font-medium">No users found</p>
                                                <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map(user => {
                                            const isSelected = selectedIds.has(user.id);
                                            return (
                                                <tr
                                                    key={user.id}
                                                    className={cn(
                                                        "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group",
                                                        isSelected && "bg-primary-600/5 hover:bg-primary-600/10 border-l-2 border-l-primary-600"
                                                    )}
                                                >
                                                    <td className="p-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelect(user.id)}
                                                            className="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-600 focus:ring-offset-0"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-primary-600/10 flex items-center justify-center text-primary-600 font-bold text-xs shrink-0">
                                                                {user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-slate-900 dark:text-white truncate"><HighlightText text={user.full_name} query={search} /></p>
                                                                <p className="text-xs text-slate-400 truncate">ID: {user.id.slice(0, 8)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-mono text-xs text-slate-500 truncate max-w-[200px]"><HighlightText text={user.email} query={search} /></td>
                                                    <td className="p-4">
                                                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize", ROLE_STYLES[user.role] || ROLE_STYLES.user)}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("w-2 h-2 rounded-full", STATUS_DOT[user.status] || "bg-slate-400")}></span>
                                                            <span className="text-slate-700 dark:text-slate-200 capitalize">{user.status}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {user.email_verified ? (
                                                            <CheckCircle2 className="h-5 w-5 text-primary-600 mx-auto" />
                                                        ) : (
                                                            <Circle className="h-5 w-5 text-slate-300 mx-auto" />
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-right tabular-nums text-slate-500 whitespace-nowrap">
                                                        {user.last_login_at
                                                            ? formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })
                                                            : "Never"}
                                                    </td>
                                                    <td className="p-4 text-right relative" ref={openDropdown === user.id ? dropdownRef : undefined}>
                                                        <button
                                                            onClick={(e) => {
                                                                const userIdx = users.findIndex(u => u.id === user.id);
                                                                const isNearBottom = userIdx >= users.length - 2;
                                                                setDropdownDirection(prev => ({ ...prev, [user.id]: isNearBottom ? 'up' : 'down' }));
                                                                setOpenDropdown(openDropdown === user.id ? null : user.id);
                                                            }}
                                                            className="text-slate-400 hover:text-primary-600 transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        >
                                                            <MoreVertical className="h-5 w-5" />
                                                        </button>

                                                        {openDropdown === user.id && (
                                                            <div className={cn(
                                                                "absolute right-4 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50",
                                                                dropdownDirection[user.id] === 'up' ? 'bottom-12' : 'top-12'
                                                            )}>
                                                                <Link
                                                                    href={`/admin/users/${user.id}`}
                                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                                                >
                                                                    <Eye className="h-4 w-4" /> View Details
                                                                </Link>
                                                                {!user.email_verified && (
                                                                    <button
                                                                        onClick={() => handleVerifyUser(user.id)}
                                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full text-left"
                                                                    >
                                                                        <ShieldCheck className="h-4 w-4" /> Verify Email
                                                                    </button>
                                                                )}
                                                                <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full text-left">
                                                                    <ShieldBan className="h-4 w-4" /> Suspend
                                                                </button>
                                                                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                                                                >
                                                                    <Trash2 className="h-4 w-4" /> Delete User
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 0 && (
                        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-slate-500">
                                Showing <span className="font-medium text-slate-900 dark:text-white">{fromIdx}</span> to <span className="font-medium text-slate-900 dark:text-white">{toIdx}</span> of <span className="font-medium text-slate-900 dark:text-white">{total.toLocaleString()}</span> results
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="hidden sm:flex gap-1">
                                    {(() => {
                                        const pages: (number | string)[] = [];
                                        const maxVisible = 5;
                                        if (totalPages <= maxVisible + 2) {
                                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                                        } else {
                                            pages.push(1);
                                            if (page > 3) pages.push("...");
                                            const start = Math.max(2, page - 1);
                                            const end = Math.min(totalPages - 1, page + 1);
                                            for (let i = start; i <= end; i++) pages.push(i);
                                            if (page < totalPages - 2) pages.push("...");
                                            pages.push(totalPages);
                                        }
                                        return pages.map((p, idx) =>
                                            typeof p === "string" ? (
                                                <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">...</span>
                                            ) : (
                                                <button
                                                    key={p}
                                                    onClick={() => setPage(p)}
                                                    className={cn(
                                                        "w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors",
                                                        p === page
                                                            ? "bg-primary-600 text-white"
                                                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                                                    )}
                                                >
                                                    {p}
                                                </button>
                                            )
                                        );
                                    })()}
                                </div>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
