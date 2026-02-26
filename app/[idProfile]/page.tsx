import Sidebar from "@/components/dashboard/Sidebar";
import ProfileHeader from "@/components/dashboard/ProfileHeader";

interface ProfilePageProps {
    params: Promise<{
        idProfile: string;
    }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { idProfile } = await params;

    // Mock data - in a real app, you'd fetch this based on idProfile
    const profileData = {
        name: "Federico Massolo",
        role: "Full Stack Developer",
        bio: "Passionate developer focused on creating beautiful and functional web applications. Specialized in React, Next.js, and modern web technologies.",
        location: "Las Tunitas, Argentina",
        email: "developer@example.com",
        github: "https://github.com/yourusername",
        linkedin: "https://linkedin.com/in/yourusername"
    };

    return (
        <div className="flex min-h-screen bg-dash-bg text-white">
            <Sidebar />

            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Profile ID Badge */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                            Profile ID:
                        </span>
                        <span className="text-xs font-mono text-accent-green bg-accent-green/10 px-3 py-1 rounded-lg">
                            {idProfile}
                        </span>
                    </div>

                    {/* Profile Header */}
                    <ProfileHeader {...profileData} />

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card-bg border border-card-border rounded-xl p-6">
                            <div className="text-3xl font-black text-accent-green mb-2">12</div>
                            <div className="text-sm text-gray-400 uppercase tracking-wider">Projects</div>
                        </div>

                        <div className="bg-card-bg border border-card-border rounded-xl p-6">
                            <div className="text-3xl font-black text-accent-green mb-2">48</div>
                            <div className="text-sm text-gray-400 uppercase tracking-wider">Commits</div>
                        </div>

                        <div className="bg-card-bg border border-card-border rounded-xl p-6">
                            <div className="text-3xl font-black text-accent-green mb-2">5</div>
                            <div className="text-sm text-gray-400 uppercase tracking-wider">Collaborators</div>
                        </div>
                    </div>

                    {/* Recent Activity Section */}
                    <div className="bg-card-bg border border-card-border rounded-xl p-6">
                        <h2 className="text-xl font-black text-white mb-4">Recent Activity</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                                <span className="text-sm text-gray-300">Updated project documentation</span>
                                <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                                <span className="text-sm text-gray-300">Merged pull request #42</span>
                                <span className="text-xs text-gray-500 ml-auto">5 hours ago</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                                <span className="text-sm text-gray-300">Created new feature branch</span>
                                <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
