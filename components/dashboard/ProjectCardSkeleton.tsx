const ProjectCardSkeleton = () => {
    return (
        <div className="flex flex-col cursor-default animate-pulse">
            {/* Thumbnail / Image area */}
            <div className="relative w-full aspect-video bg-[#1a1a1a] overflow-hidden rounded-2xl border border-[#2a2a2a]">
                {/* Simulated Growth bar */}
                <div className="absolute left-2 top-3 bottom-3 w-[3px] rounded-full bg-[#262626]" />

                {/* Simulated Status badge */}
                <div className="absolute top-2 left-6 w-16 h-4 rounded-full bg-[#262626]" />

                {/* Simulated PM avatar */}
                <div className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-[#262626]" />
            </div>

            {/* Card info */}
            <div className="px-1 pt-3 pb-1 space-y-3">
                {/* Simulated Project name */}
                <div className="h-4 bg-[#262626] rounded w-3/4" />

                {/* Simulated Growth stage + date info */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 bg-[#262626] rounded w-12" />
                        <div className="flex-1 h-[2px] rounded-full bg-[#262626]" />
                        <div className="h-2.5 bg-[#262626] rounded w-6" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="h-2 bg-[#262626] rounded w-16" />
                        <div className="h-2 bg-[#262626] rounded w-16" />
                    </div>
                </div>

                {/* Simulated Team avatars */}
                <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-7 h-7 rounded-md bg-[#262626] shrink-0" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectCardSkeleton;
