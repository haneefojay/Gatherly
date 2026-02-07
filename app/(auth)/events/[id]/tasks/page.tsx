'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Event, Task, TaskCreateRequest } from '@/lib/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { ArrowLeft, CheckCircle2, Circle, Trash2, Plus, Edit2, ListTodo, Shield } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import TaskForm from '@/components/tasks/TaskForm';

export default function TasksPage() {
    const router = useRouter();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<Event | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);

    // Error states
    const [pageError, setPageError] = useState<string | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // Edit state
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter state
    const [activeFilter, setActiveFilter] = useState<'all' | 'mine'>('all');

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventRes, tasksRes] = await Promise.all([
                api.get<Event>(`/events/${id}`),
                api.get<Task[]>(`/events/${id}/tasks`)
            ]);
            setEvent(eventRes.data);
            setTasks(tasksRes.data);
            setPageError(null);
        } catch (error: any) {
            console.error('Failed to fetch task data', error);
            setPageError(error.response?.data?.detail || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (data: TaskCreateRequest) => {
        setCreating(true);
        setModalError(null);
        try {
            await api.post(`/events/${id}/tasks`, data);
            setIsCreateModalOpen(false);
            fetchData();
        } catch (error: any) {
            console.error('Failed to create task', error);
            const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to create task';
            setModalError(Array.isArray(msg) ? msg[0].msg : msg);
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateTask = async (data: any) => {
        if (!editingTask) return;
        setUpdating(true);
        setModalError(null);
        try {
            await api.put(`/tasks/${editingTask.id}`, data);
            setIsEditModalOpen(false);
            setEditingTask(null);
            fetchData();
        } catch (error: any) {
            console.error('Failed to update task', error);
            const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to update task';
            setModalError(Array.isArray(msg) ? msg[0].msg : msg);
        } finally {
            setUpdating(false);
        }
    };

    const handleToggleComplete = async (task: Task) => {
        try {
            setPageError(null);
            await api.put(`/tasks/${task.id}`, {
                completed: !task.completed
            });
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
        } catch (error: any) {
            console.error('Failed to toggle task', error);
            const msg = error.response?.data?.detail || error.response?.data?.message || 'Failed to update task status';
            setPageError(msg);
        }
    };

    const initiateDeleteTask = (taskId: string) => {
        setTaskToDelete(taskId);
        setShowDeleteConfirm(true);
        setPageError(null);
    };

    const handleConfirmDelete = async () => {
        if (!taskToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/tasks/${taskToDelete}`);
            setTasks(prev => prev.filter(t => t.id !== taskToDelete));
            setShowDeleteConfirm(false);
            setTaskToDelete(null);
        } catch (error: any) {
            console.error('Failed to delete task', error);
            setPageError(error.response?.data?.detail || 'Failed to delete task');
            setShowDeleteConfirm(false);
        } finally {
            setIsDeleting(false);
        }
    };

    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setIsEditModalOpen(true);
        setModalError(null);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

    // Permissions
    const isOrganizer = user && event && (event.organizer_ids.includes(user.id) || user.role === 'admin');

    if (!isOrganizer) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-ash-900 mb-2">Access Denied</h1>
                    <p className="text-ash-400 mb-4">Only organizers can manage tasks.</p>
                    <Link href={`/events/${id}`}>
                        <Button variant="secondary">Go Back</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const assignedTasks = tasks.map(task => {
        const assignee = event?.organizers?.find(org => org.id === task.assignee_id);
        return {
            ...task,
            assigneeName: assignee ? assignee.full_name : null
        };
    });

    const filteredTasks = assignedTasks.filter(task => {
        if (activeFilter === 'mine') {
            return task.assignee_id === user?.id;
        }
        return true;
    });

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="max-w-5xl mx-auto px-2">
                <Link href={`/events/${id}`} className="inline-flex items-center text-ash-400 hover:text-primary-900 mb-6 transition-colors font-bold text-xs uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Event
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-ash-900 mb-3 tracking-tight">
                            Event Tasks
                        </h1>
                        <p className="text-ash-500 font-medium text-lg">
                            Manage to-dos for <span className="text-primary-900 font-bold">{event?.title}</span>
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setIsCreateModalOpen(true);
                            setModalError(null);
                        }}
                        className="rounded-xl px-8 h-12 shadow-primary"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Task
                    </Button>
                </div>

                {pageError && (
                    <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        {pageError}
                    </div>
                )}

                <div className="flex bg-white p-1.5 rounded-2xl border border-ash-200 w-fit mb-8 shadow-sm">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={cn(
                            "px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                            activeFilter === 'all'
                                ? "bg-primary-900 text-white shadow-lg shadow-primary-900/20"
                                : "text-ash-400 hover:text-ash-900 hover:bg-ash-50"
                        )}
                    >
                        All Tasks ({tasks.length})
                    </button>
                    <button
                        onClick={() => setActiveFilter('mine')}
                        className={cn(
                            "px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                            activeFilter === 'mine'
                                ? "bg-primary-900 text-white shadow-lg shadow-primary-900/20"
                                : "text-ash-400 hover:text-ash-900 hover:bg-ash-50"
                        )}
                    >
                        My Tasks ({tasks.filter(t => t.assignee_id === user?.id).length})
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredTasks.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center py-20 border-dashed border-2">
                            <div className="w-16 h-16 rounded-full bg-ash-50 flex items-center justify-center mb-4 text-ash-300">
                                <ListTodo className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-ash-900 mb-1">No tasks yet</h3>
                            <p className="text-ash-500">
                                {activeFilter === 'mine' ? "You have no tasks assigned." : "Create a task to get started."}
                            </p>
                        </Card>
                    ) : (
                        filteredTasks.map(task => {
                            const canComplete = user && (user.role === 'admin' || event?.created_by_id === user.id || task.assignee_id === user.id);

                            return (
                                <Card key={task.id} className="p-6 group hover:border-primary-900/10 transition-all duration-300">
                                    <div className="flex items-start gap-5">
                                        <button
                                            onClick={() => canComplete && handleToggleComplete(task)}
                                            disabled={!canComplete}
                                            className={cn(
                                                "mt-1 flex-shrink-0 transition-all duration-300 transform active:scale-90",
                                                task.completed
                                                    ? 'text-primary-900'
                                                    : canComplete
                                                        ? 'text-ash-200 hover:text-primary-900'
                                                        : 'text-ash-100 cursor-not-allowed'
                                            )}
                                        >
                                            {task.completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className={cn(
                                                        "font-bold text-lg mb-1 transition-all",
                                                        task.completed ? 'text-ash-400 line-through italic' : 'text-ash-900 underline-offset-4 decoration-2 decoration-mint-400 group-hover:underline'
                                                    )}>
                                                        {task.title}
                                                    </h3>
                                                    {task.description && (
                                                        <p className={cn(
                                                            "text-sm leading-relaxed",
                                                            task.completed ? 'text-ash-300' : 'text-ash-500'
                                                        )}>
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openEditModal(task)}
                                                        className="p-2.5 text-ash-400 hover:text-primary-900 hover:bg-mint-50 rounded-xl transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => initiateDeleteTask(task.id)}
                                                        className="p-2.5 text-ash-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex items-center gap-4">
                                                {task.assigneeName ? (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-ash-50 border border-ash-100">
                                                        <div className="w-4 h-4 rounded-full bg-primary-900 flex items-center justify-center text-[8px] text-white font-black">
                                                            {task.assigneeName.charAt(0)}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-ash-600 uppercase tracking-widest">
                                                            Assigned to {task.assigneeName}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-ash-50 border border-dashed border-ash-200">
                                                        <Shield className="w-3 h-3 text-ash-400" />
                                                        <span className="text-[10px] font-bold text-ash-400 uppercase tracking-widest">Unassigned</span>
                                                    </div>
                                                )}
                                                {task.completed && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 border border-mint-100">
                                                        <CheckCircle2 className="w-3 h-3 text-primary-900" />
                                                        <span className="text-[10px] font-bold text-primary-900 uppercase tracking-widest">Completed</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>

                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Create New Task"
                >
                    {modalError && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {modalError}
                        </div>
                    )}
                    <TaskForm
                        assignees={event?.organizers || []}
                        onSubmit={handleCreateTask}
                        isLoading={creating}
                    />
                </Modal>

                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingTask(null);
                    }}
                    title="Edit Task"
                >
                    {modalError && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {modalError}
                        </div>
                    )}
                    {editingTask && (
                        <TaskForm
                            initialValues={editingTask}
                            assignees={event?.organizers || []}
                            onSubmit={handleUpdateTask}
                            isLoading={updating}
                            submitLabel="Save Changes"
                        />
                    )}
                </Modal>

                <ConfirmationModal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Task"
                    message="Are you sure you want to delete this task? This action cannot be undone."
                    confirmLabel="Delete"
                    isLoading={isDeleting}
                />
            </div>
        </div>
    );
}
