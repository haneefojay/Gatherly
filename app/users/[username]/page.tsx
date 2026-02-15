"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPublicProfile, getPublicEvents, getAttendingEvents, getUserReviews, followUser, unfollowUser } from "@/lib/profile-service";
import { PublicProfile, Event, Review } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { User } from "lucide-react";

export default function PublicProfilePage() {
    const { username } = useParams<{ username: string }>();
    const { user: currentUser } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
    const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'organized' | 'attending' | 'reviews'>('organized');
    const [isFollowing, setIsFollowing] = useState(false);


    // Fetch profile data
    useEffect(() => {
        if (!username) return;

        const fetchData = async () => {
            try {
                const profileData = await getPublicProfile(username);
                setProfile(profileData);
                setIsFollowing(profileData.is_following);

                // Load initial tab data
                const eventsData = await getPublicEvents(username);
                setOrganizedEvents(eventsData.items);

                const attendingData = await getAttendingEvents(username);
                setAttendingEvents(attendingData.items);

                const reviewsData = await getUserReviews(username);
                setReviews(reviewsData.reviews);

            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [username]);

    const handleFollowToggle = async () => {
        if (!currentUser) {
            router.push(`/login?redirect=/users/${username}`);
            return;
        }

        if (!profile) return;
        try {
            if (isFollowing) {
                await unfollowUser(profile.username);
                setIsFollowing(false);
            } else {
                await followUser(profile.username);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Failed to toggle follow", error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!profile) {
        return <div className="flex justify-center items-center min-h-screen">User not found</div>;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <PublicNavbar />
            <main className="flex-1 pb-12">
                {/* Profile Header Section */}
                <div className="bg-white dark:bg-[#15192b] shadow-sm pb-8 mb-8">
                    {/* Cover Photo */}
                    <div className="h-64 w-full relative group overflow-hidden">
                        <img
                            src={profile.cover_photo_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDw08O0CahAje7qd2wUNt94pNlhSE1QGKIVrmnkf-cZatf3iRCqNXztZwIkKC15R8QTA4gOM3K5gLvnlvy7VmUV6yF5B7fkFX7tn00JZjMi7h9eYbKXf2jYgSaRJ_SjNjACPKbmgMOB1E0a_q6JkWBn6Iqj__LlwfvLaJbda--l00eHcZLdbopz6LNVhyCXGl1B4imb2gI_o8o7WS6AgNjaS5EnMIpsKpek0ujxNAfr59-bjz7rjo2fgqw3Lz9L0_CEztzxCS7ZhA"}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                         
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        {currentUser?.username === profile.username && (
                            <button className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 hover:bg-white text-slate-700 dark:text-white px-3 py-1.5 rounded text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center shadow-lg backdrop-blur-sm">
                                <span className="material-icons text-sm mr-1">photo_camera</span> Edit Cover
                            </button>
                        )}
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative -mt-16 sm:-mt-24 mb-6 flex flex-col sm:flex-row items-end sm:items-end gap-6">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full ring-4 ring-white dark:ring-[#15192b] bg-white overflow-hidden shadow-lg">
                                    {profile.avatar_url ? 
                                    (<img
                                        src={profile.avatar_url}
                                        alt={profile.full_name}
                                        className="w-full h-full object-cover"
                                    />) : (<User className="w-full h-full text-slate-400 object-cover" />)}
                                </div>
                                <span className="absolute bottom-2 right-2 h-5 w-5 bg-green-500 border-2 border-white dark:border-[#15192b] rounded-full" title="Online"></span>
                            </div>

                            {/* User Info & Actions */}
                            <div className="flex-1 w-full sm:pb-2">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.full_name}</h1>
                                        <p className="text-primary-600 font-medium text-lg">@{profile.username}</p>
                                        <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                            {profile.job_title && (
                                                <>
                                                    <span className="material-icons text-sm">work</span> {profile.job_title}
                                                    <span className="mx-1">•</span>
                                                </>
                                            )}
                                            {profile.location && (
                                                <>
                                                    <span className="material-icons text-sm">location_on</span> {profile.location}
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex gap-3 mt-2 sm:mt-0">
                                        {currentUser?.username !== profile.username && (
                                            <button
                                                onClick={handleFollowToggle}
                                                className={`px-6 py-2.5 font-medium rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 ${isFollowing
                                                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                                                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                                                    }`}
                                            >
                                                <span className="material-icons text-sm">{isFollowing ? 'check' : 'person_add'}</span>
                                                {isFollowing ? 'Following' : 'Follow'}
                                            </button>
                                        )}
                                        <button className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg shadow-sm transition-all flex items-center gap-2">
                                            <span className="material-icons text-sm">mail</span> Message
                                        </button>
                                        {currentUser?.username === profile.username && (
                                            <Link href="/profile/edit" className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm transition-all flex items-center justify-center">
                                                <span className="material-icons text-sm">edit</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio and Social Links */}
                        {(profile.bio || profile.social_links) && (
                            <div className="max-w-3xl mb-8">
                                {profile.bio && (
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {profile.bio}
                                    </p>
                                )}

                                {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                                    <div className="flex gap-4 mt-4">
                                        {Object.entries(profile.social_links).map(([platform, url]) => (
                                            <a
                                                key={platform}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-slate-400 hover:text-primary transition-colors flex items-center justify-center"
                                                title={platform}
                                            >
                                                <span className="material-icons">
                                                    {platform.toLowerCase() === 'website' ? 'language' :
                                                        platform.toLowerCase() === 'twitter' ? 'rss_feed' :
                                                            platform.toLowerCase() === 'github' ? 'code' :
                                                                'link'}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Stats Bar */}
                        <div className="flex flex-wrap gap-8 py-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <span className="material-icons">event_available</span>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{profile.events_organized_count}</div>
                                    <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">Organized</div>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                    <span className="material-icons">confirmation_number</span>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{profile.events_attended_count}</div>
                                    <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">Attended</div>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                                    <span className="material-icons">star</span>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{profile.average_rating || 'N/A'}</div>
                                    <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">Rating ({profile.review_count})</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="border-t border-slate-200 dark:border-slate-800 sticky top-16 bg-white dark:bg-[#15192b] z-40 shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('organized')}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'organized' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                                >
                                    <span className="material-icons text-base">grid_view</span> Organized Events
                                </button>
                                <button
                                    onClick={() => setActiveTab('attending')}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'attending' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                                >
                                    <span className="material-icons text-base">calendar_today</span> Attending
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-0.5 px-2 rounded-full text-xs ml-1">{profile.events_attended_count}</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                                >
                                    <span className="material-icons text-base">reviews</span> Reviews
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Tab Content Area */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Organized Events Tab */}
                    {activeTab === 'organized' && (
                        <div className="mb-12">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Events Organized by {profile.full_name}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {organizedEvents.map(event => (
                                    <Link href={`/events/${event.id}`} key={event.id} className="group bg-white dark:bg-[#15192b] rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full">
                                        <div className="relative h-48 overflow-hidden bg-gray-200">
                                            {/* Placeholder image or event image if available */}
                                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary/30">
                                                <span className="material-icons text-6xl">event</span>
                                            </div>
                                            <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide text-primary shadow-sm">
                                                {event.status}
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">Event</span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">Free</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">{event.title}</h3>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-slate-500 text-sm">
                                                    <span className="material-icons text-base mr-2 text-slate-400">event</span>
                                                    {new Date(event.start_date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center text-slate-500 text-sm">
                                                    <span className="material-icons text-base mr-2 text-slate-400">location_on</span>
                                                    {event.location || 'Online'}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {organizedEvents.length === 0 && <p className="text-slate-500 col-span-3 text-center py-8">No events organized yet.</p>}
                            </div>
                        </div>
                    )}

                    {/* Attending Events Tab */}
                    {activeTab === 'attending' && (
                        <div className="mb-12">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Attending</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {attendingEvents.map(event => (
                                    <Link href={`/events/${event.id}`} key={event.id} className="group bg-white dark:bg-[#15192b] rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-full">
                                        <div className="relative h-48 overflow-hidden bg-gray-200">
                                            <div className="absolute inset-0 bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-400/50">
                                                <span className="material-icons text-6xl">confirmation_number</span>
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">{event.title}</h3>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-slate-500 text-sm">
                                                    <span className="material-icons text-base mr-2 text-slate-400">event</span>
                                                    {new Date(event.start_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {attendingEvents.length === 0 && <p className="text-slate-500 col-span-3 text-center py-8">Not attending any upcoming events.</p>}
                            </div>
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Summary Column */}
                            <div className="lg:col-span-1">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Reviews & Feedback</h2>
                                <div className="bg-white dark:bg-[#15192b] p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-end gap-2 mb-2">
                                        <span className="text-5xl font-bold text-slate-900 dark:text-white">{profile.average_rating || 0}</span>
                                        <span className="text-slate-500 dark:text-slate-400 mb-2">/ 5.0</span>
                                    </div>
                                    <div className="flex text-amber-400 mb-4">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span key={star} className={`material-icons ${star <= (profile.average_rating || 0) ? '' : 'text-slate-200 dark:text-slate-700'}`}>star</span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-500 mb-6">Based on {profile.review_count} verified reviews.</p>
                                    {/* Rating Bars */}
                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map(star => {
                                            const count = profile.rating_distribution[star] || 0;
                                            const percentage = profile.review_count > 0 ? (count / profile.review_count) * 100 : 0;
                                            return (
                                                <div key={star} className="flex items-center text-sm">
                                                    <span className="w-8 text-slate-600 dark:text-slate-400">{star} <span className="text-xs">★</span></span>
                                                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full mx-2 overflow-hidden">
                                                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                    <span className="w-8 text-right text-slate-400">{Math.round(percentage)}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            {/* Review List Column */}
                            <div className="lg:col-span-2">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Recent Feedback</h3>
                                </div>
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <div key={review.id} className="bg-white dark:bg-[#15192b] p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={review.user_avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDzcTLoMYN7F4KX8LsDk7uDOdniE0WqyPWW1OEmUiW5VK3_-jrbatqy8-2xGWFx1w3d6uUSOP86Oz83opVkBJbBuULYhiMQzlWz_7WKb2gEu8CG8UC7wUoCs6xE4l01jxzIi5s2C7IgyG1wqRuFxxtaDoJ7ZhdMNKSyGahsaO60o7AQeBmn3FlO8kBQml4WoQxwnsK60Dfr6fNhNFJuQrQfi7TsuvG1cNmC-uXStOBtx8S7hUvhprfa0IxrR2b7OTjltqHY6S-vhg"} alt={review.user_name} className="w-10 h-10 rounded-full" />
                                                    <div>
                                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{review.user_name}</h4>
                                                        <p className="text-xs text-slate-500">Attended {review.event_title}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex text-amber-400 text-sm mb-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span key={star} className={`material-icons text-base ${star <= review.rating ? '' : 'text-slate-200 dark:text-slate-700'}`}>star</span>
                                                ))}
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                                "{review.content}"
                                            </p>
                                        </div>
                                    ))}
                                    {reviews.length === 0 && <p className="text-slate-500">No reviews yet.</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
