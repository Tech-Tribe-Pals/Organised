import { type TeamMember } from "@/lib/projects";

interface Props {
  pm?: TeamMember;
  team: TeamMember[];
}

const TeamSection = ({ pm, team }: Props) => {
  // Combine PM and Team into one array to render
  const allMembers = [];
  if (pm) {
    allMembers.push({ ...pm, role: "PM" });
  }
  team.forEach(m => {
    allMembers.push({ ...m, role: "Miembro" });
  });

  return (
    <div>
      <h3 className="text-base font-bold text-white mb-3">Integrantes</h3>
      <div className="grid grid-cols-3 gap-3">
        {allMembers.map((member, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-base font-bold shrink-0 overflow-hidden bg-[#1e1e1e] border border-[#2a2a2a]"
              style={{ backgroundColor: !member.avatar ? member.color : undefined }}
            >
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-black text-xl font-bold">{member.name.charAt(0)}</span>
              )}
            </div>
            <div className="text-center">
              <p className="text-white text-[11px] font-semibold leading-tight">{member.name}</p>
              <p className="text-gray-500 text-[10px] leading-tight">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamSection;
