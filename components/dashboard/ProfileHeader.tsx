"use client";
import { User, Github, Linkedin, Mail, MapPin } from 'lucide-react';

interface ProfileHeaderProps {
    name: string;
    role: string;
    bio?: string;
    location?: string;
    email?: string;
    github?: string;
    linkedin?: string;
}

const ProfileHeader = ({
    name,
    role,
    bio,
    location,
    email,
    github,
    linkedin
}: ProfileHeaderProps) => {
    return (
        <div className="bg-card-bg border border-card-border rounded-2xl p-8">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-6 mb-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-accent-green/10 border-2 border-accent-green/20 flex items-center justify-center">
                    <User size={48} className="text-accent-green" />
                </div>

                {/* Name and Role */}
                <div className="flex-1">
                    <h1 className="text-3xl font-black text-white mb-2">{name}</h1>
                    <p className="text-lg text-gray-400 font-medium">{role}</p>

                    {location && (
                        <div className="flex items-center gap-2 mt-3 text-gray-500">
                            <MapPin size={16} />
                            <span className="text-sm">{location}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bio */}
            {bio && (
                <div className="mb-6">
                    <p className="text-gray-300 leading-relaxed">{bio}</p>
                </div>
            )}

            {/* Social Links */}
            <div className="flex gap-4">
                {email && (
                    <a
                        href={`mailto:${email}`}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-card-border rounded-lg transition-colors"
                    >
                        <Mail size={18} className="text-accent-green" />
                        <span className="text-sm text-gray-300">Email</span>
                    </a>
                )}

                {github && (
                    <a
                        href={github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-card-border rounded-lg transition-colors"
                    >
                        <Github size={18} className="text-accent-green" />
                        <span className="text-sm text-gray-300">GitHub</span>
                    </a>
                )}

                {linkedin && (
                    <a
                        href={linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-card-border rounded-lg transition-colors"
                    >
                        <Linkedin size={18} className="text-accent-green" />
                        <span className="text-sm text-gray-300">LinkedIn</span>
                    </a>
                )}
            </div>
        </div>
    );
};

export default ProfileHeader;
