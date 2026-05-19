"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadZone } from "@/components/upload-zone"
import { GenerateSection } from "@/components/generate-section"
import { OutputSection } from "@/components/output-section"
import { Toaster } from "@/components/ui/sonner"
import { useImageStore } from "@/store/use-image-store"
import { 
  LayoutTemplate, 
  Shapes, 
  Type, 
  CloudUpload, 
  FolderOpen, 
  Settings, 
  HelpCircle, 
  Wand2, 
  Sparkles,
  ChevronDown
} from "lucide-react"

export default function Home() {
  return (
    <main className="h-screen flex bg-[#0F0F0F] text-white overflow-hidden selection:bg-purple-500/30">
      
      <aside className="w-[72px] flex flex-col items-center py-4 border-r border-white/5 bg-[#18191B] z-50">
        <div className="mb-8 p-2 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20">
          <Wand2 className="h-6 w-6" />
        </div>
        
        <div className="flex flex-col gap-6 flex-1">
          <SidebarIcon icon={<LayoutTemplate size={20} />} label="Templates" />
          <SidebarIcon icon={<Shapes size={20} />} label="Elements" />
          <SidebarIcon icon={<Type size={20} />} label="Text" active />
          <SidebarIcon icon={<CloudUpload size={20} />} label="Uploads" />
          <SidebarIcon icon={<FolderOpen size={20} />} label="Projects" />
        </div>

        <div className="flex flex-col gap-6 mt-auto">
          <SidebarIcon icon={<Settings size={20} />} label="Settings" />
          <SidebarIcon icon={<HelpCircle size={20} />} label="Help" />
        </div>
      </aside>

      <aside className="w-[300px] border-r border-white/5 bg-[#1B1C1E] flex flex-col z-40">
        <div className="p-4 border-b border-white/5 space-y-6">
          <div>
            <h2 className="text-sm font-bold mb-4">Uploads</h2>
            <UploadZone variant="minimal-button" />
          </div>
          
          <div className="space-y-3">
             <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Choose Agent</h3>
             <AgentDropdown />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="space-y-4">
             <UploadZone variant="grid-only" />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-white/5 bg-[#18191B] flex items-center justify-between px-6 z-40">
          <div className="flex items-center gap-4">
             <span className="text-sm font-semibold tracking-[0.12em] text-white/75"></span>
             <div className="h-4 w-[1px] bg-white/10" />
             <span className="text-sm font-bold">Real Estate HDR Fusion</span>
          </div>
        </header>

        <div className="flex-1 bg-[#0F0F0F] relative overflow-hidden flex flex-col items-center">
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
           
           <div className="relative z-10 w-full max-w-[1400px] p-8 flex-1 min-h-0 flex flex-col justify-center">
              <div className="w-full">
                 <OutputSection />
              </div>
           </div>

           <footer className="relative z-10 w-full border-t border-white/5 bg-[#18191B]/80 px-6 py-3 text-center text-xs font-medium text-white/60">
           </footer>
        </div>
      </div>

      <div className="fixed bottom-6 left-[88px] w-[268px] z-50">
        <GenerateSection variant="toolbar" />
      </div>

      <Toaster position="top-right" expand={true} richColors />
    </main>
  )
}


function AgentDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { selectedAgent, setAgent } = useImageStore()
  
  const agents = [
    { name: "gpt image-5", icon: <Sparkles size={14} /> },
    { name: "gemini-flash-2.0", icon: <Wand2 size={14} /> }
  ]

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs font-bold flex items-center justify-between transition-colors hover:bg-white/[0.08] focus:border-purple-500/50"
      >
        <span className="flex items-center gap-2">
          {agents.find(a => a.name === selectedAgent)?.icon}
          {selectedAgent}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 4 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-[#25262B] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[100]"
          >
            {agents.map((agent) => (
              <button
                key={agent.name}
                onClick={() => {
                  setAgent(agent.name)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-colors hover:bg-white/5 ${
                  selectedAgent === agent.name ? 'text-purple-400 bg-purple-500/5' : 'text-white/60'
                }`}
              >
                {agent.icon}
                {agent.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SidebarIcon({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex flex-col items-center gap-1 group transition-colors ${active ? 'text-white' : 'text-white/40 hover:text-white'}`}>
      <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-white/10' : 'group-hover:bg-white/5'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}
