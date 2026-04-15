function ScenarioBtn({ label, desc, onClick, color = "blue", icon }: { label: string, desc: string, onClick: () => void, color?: string, icon?: React.ReactNode }) {
    return (
        <button 
            onClick={onClick}
            className={`w-full text-left p-3 rounded-xl border border-gray-800/60 bg-[#1f1f1f] hover:bg-[#252525] hover:border-gray-600 transition-all group flex items-start gap-3 relative overflow-hidden`}
        >
            {/* Icon Wrapper */}
            <div className="mt-1 relative z-10 p-1.5 rounded-md bg-black/20 group-hover:bg-black/40 transition-colors">
                {icon}
            </div>
            
            {/* Text Content */}
            <div className="relative z-10 flex-1">
                <div className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">{label}</div>
                {/* اینجا خطی بود که قطع شده بود */}
                <div className="text-[10px] text-gray-500 mt-0.5 group-hover:text-gray-400 transition-colors leading-snug">
                    {desc}
                </div>
            </div>

            {/* Subtle Hover Gradient Effect based on color prop */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-${color}-500 pointer-events-none`} />
        </button>
    );
}
