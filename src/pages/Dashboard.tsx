import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { 
  BarChart3, 
  Users, 
  Layers, 
  Settings, 
  Plus, 
  FileText, 
  Link as LinkIcon,
  Search,
  ExternalLink,
  X,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  setDoc,
  doc,
  serverTimestamp,
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

const chartData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 7000 },
  { name: 'Fri', revenue: 6000 },
  { name: 'Sat', revenue: 8000 },
  { name: 'Sun', revenue: 9500 },
];

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'vault' | 'members'>('analytics');
  const [showCreateDrop, setShowCreateDrop] = useState(false);
  const [drops, setDrops] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [newDrop, setNewDrop] = useState({ title: '', type: 'link' as const, url: '', tier: 'Elite' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState({ bio: '', bannerImage: '' });

  useEffect(() => {
    if (!user) return;

    // Fetch Drops
    const dropsPath = 'drops';
    const dropsQuery = query(
      collection(db, dropsPath),
      where('creatorId', '==', user.uid),
      orderBy('releasedAt', 'desc')
    );

    const unsubDrops = onSnapshot(dropsQuery, (snap) => {
      setDrops(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, dropsPath);
    });

    // Fetch Members (via subscriptions)
    const membersPath = 'subscriptions';
    const membersQuery = query(
      collection(db, membersPath),
      where('creatorId', '==', user.uid)
    );

    const unsubMembers = onSnapshot(membersQuery, (snap) => {
      setMembers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, membersPath);
    });

    // Fetch Creator Meta
    const metaDoc = doc(db, 'creators', user.uid);
    const unsubMeta = onSnapshot(metaDoc, (snap) => {
      if (snap.exists()) {
        setCreatorProfile(snap.data() as any);
      }
    });

    return () => {
      unsubDrops();
      unsubMembers();
      unsubMeta();
    };
  }, [user]);

  const handleUpdateCreatorMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await setDoc(doc(db, 'creators', user.uid), creatorProfile, { merge: true });
      setShowSettings(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `creators/${user.uid}`);
    }
  };

  const handleCreateDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    const path = 'drops';
    try {
      await addDoc(collection(db, path), {
        ...newDrop,
        creatorId: user.uid,
        tierId: 'elite_tier', // simplified for demo
        releasedAt: serverTimestamp(),
      });
      setShowCreateDrop(false);
      setNewDrop({ title: '', type: 'link', url: '', tier: 'Elite' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Hello, {profile.displayName}</h1>
          <p className="text-white/40">Manage your {profile.role} account and insights.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
          {[
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'vault', icon: Layers, label: 'The Vault' },
            { id: 'members', icon: Users, label: 'Members' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === tab.id ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          <button 
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 rounded-lg text-sm text-white/40 hover:text-white transition-all ml-2"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-4 gap-4"
          >
            {/* Primary Metric: MRR */}
            <div className="col-span-4 lg:col-span-2 row-span-2 premium-card p-8 flex flex-col relative overflow-hidden h-[400px]">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <BarChart3 className="w-32 h-32 text-brand" />
              </div>
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-2">Monthly Recurring Revenue</p>
              <h2 className="text-6xl font-bold mb-4">${(members.length * 49).toLocaleString()}<span className="text-brand text-2xl">.00</span></h2>
              <div className="flex items-center gap-2 text-green-400 text-sm font-bold mb-8">
                <Plus className="w-4 h-4" />
                <span>+12.4% from last month</span>
              </div>
              <div className="mt-auto space-y-4">
                <div className="h-1.5 bg-white/5 w-full rounded-full overflow-hidden">
                  <div className="h-full bg-brand w-[65%] shadow-[0_0_10px_rgba(93,92,255,0.5)]"></div>
                </div>
                <p className="text-[11px] text-white/40 uppercase font-bold tracking-tight">65% of Q1 Revenue Goal Reached</p>
              </div>
            </div>

            {/* Next Drop Card */}
            <div className="col-span-4 lg:col-span-1 row-span-2 bg-brand rounded-[--radius-custom] p-8 flex flex-col justify-between glow-indigo">
              <div>
                <div className="bg-white/20 w-fit px-2 py-1 rounded text-[10px] font-bold uppercase mb-6">Upcoming</div>
                <h3 className="text-2xl font-bold leading-tight mb-4 text-white">Next Exclusive Content Drop</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-6">You have {drops.length} active drops. Keep the momentum going for your {members.length} members.</p>
              </div>
              <Button 
                variant="secondary" 
                className="w-full py-4 text-black font-bold"
                onClick={() => setActiveTab('vault')}
              >
                Manage Drops
              </Button>
            </div>

            {/* Small Stat Cards */}
            <div className="col-span-2 lg:col-span-1 row-span-1 premium-card p-6 flex flex-col justify-center">
              <p className="text-white/40 text-[10px] uppercase font-bold mb-1">Churn Rate</p>
              <h4 className="text-4xl font-bold tracking-tight">2.1%</h4>
              <p className="text-green-400/60 text-[10px] mt-1 font-bold">-0.4% improvement</p>
            </div>

            <div className="col-span-2 lg:col-span-1 row-span-1 premium-card p-6 flex flex-col justify-center">
              <p className="text-white/40 text-[10px] uppercase font-bold mb-2">Active Members</p>
              <h4 className="text-4xl font-bold tracking-tight">{members.length}</h4>
              <div className="flex -space-x-2 mt-4">
                {members.slice(0, 3).map((m, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-brand/30 border-2 border-black flex items-center justify-center text-[8px]">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                ))}
                {members.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-brand border-2 border-black flex items-center justify-center text-[8px] font-bold">
                    +{members.length - 3}
                  </div>
                )}
              </div>
            </div>

            {/* System Status */}
            <div className="col-span-4 premium-card p-6 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 text-center md:text-left">
                <p className="text-white/40 text-[10px] uppercase font-bold mb-3">System Status</p>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-sm font-bold">Cloud Live & Syncing</span>
                </div>
              </div>
              <div className="hidden md:block h-12 w-[1px] bg-white/10"></div>
              <div className="flex-grow">
                <p className="text-sm text-white/60 mb-1 font-medium italic">"Real-time database listener active for {profile.displayName}."</p>
                <p className="text-[10px] text-brand font-bold uppercase tracking-widest">Active Connection</p>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-lg flex items-center justify-between gap-4">
                <span className="text-[10px] text-white/40 font-bold uppercase">Latency</span>
                <span className="text-xs font-mono text-brand font-bold">12ms</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'vault' && (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search drops..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:border-brand/50 transition-colors"
                />
              </div>
              {profile.role === 'creator' && (
                <Button onClick={() => setShowCreateDrop(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                   Create Drop
                </Button>
              )}
            </div>

            {drops.length === 0 ? (
              <div className="premium-card p-12 text-center">
                <Layers className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No drops yet</h3>
                <p className="text-white/40 mb-6">Start by creating your first exclusive content drop.</p>
                {profile.role === 'creator' && (
                  <Button onClick={() => setShowCreateDrop(true)} variant="outline">Create Drop</Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {drops.map((drop, i) => (
                  <motion.div
                    key={drop.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="premium-card p-6 flex flex-col group"
                  >
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-brand/20 transition-colors">
                      {drop.type === 'pdf' ? <FileText className="w-5 h-5 text-red-400" /> : <LinkIcon className="w-5 h-5 text-blue-400" />}
                    </div>
                    <h4 className="font-bold mb-2">{drop.title}</h4>
                    <p className="text-xs text-white/40 mb-4 line-clamp-2 truncate max-w-full overflow-hidden">{drop.url}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] text-white/40 uppercase tracking-tighter flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Live
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand uppercase">{drop.tier}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="premium-card p-0 overflow-hidden"
          >
            {members.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40">No members yet. Share your profile to start growing.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/40">Member ID</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/40">Tier</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/40">Status</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/40 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand text-[8px] font-bold">
                            UID
                          </div>
                          <p className="text-xs font-mono text-white/50">{member.memberId.slice(0, 12)}...</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10">Elite</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-xs">{member.status}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-mono text-right">$49.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md premium-card p-8 shadow-2xl border-white/10"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <h3 className="text-2xl font-bold">Public Profile</h3>
                <p className="text-white/40 text-sm">Control how your fans see your vault.</p>
              </div>

              <form onSubmit={handleUpdateCreatorMeta} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Public Bio</label>
                  <textarea 
                    value={creatorProfile.bio}
                    onChange={(e) => setCreatorProfile({...creatorProfile, bio: e.target.value})}
                    placeholder="Tell your fans what they get by joining your elite circle..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand/50 h-32 md:h-24 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Banner Image URL</label>
                  <input 
                    value={creatorProfile.bannerImage}
                    onChange={(e) => setCreatorProfile({...creatorProfile, bannerImage: e.target.value})}
                    type="url" 
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand/50"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <Button type="submit" className="flex-1">
                    Save Changes
                  </Button>
                   <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => window.open(`/creator/${user?.uid}`, '_blank')}
                  >
                    Preview
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Drop Modal */}
      <AnimatePresence>
        {showCreateDrop && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateDrop(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md premium-card p-8 shadow-2xl border-white/10"
            >
              <button 
                onClick={() => setShowCreateDrop(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <h3 className="text-2xl font-bold">New Content Drop</h3>
                <p className="text-white/40 text-sm">Release something exclusive to your members.</p>
              </div>

              <form onSubmit={handleCreateDrop} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Title</label>
                  <input 
                    required
                    value={newDrop.title}
                    onChange={(e) => setNewDrop({...newDrop, title: e.target.value})}
                    type="text" 
                    placeholder="E.g. Designer Resource Pack"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Type</label>
                    <select 
                      value={newDrop.type}
                      onChange={(e) => setNewDrop({...newDrop, type: e.target.value as any})}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand/50"
                    >
                      <option value="link">Link</option>
                      <option value="pdf">PDF</option>
                      <option value="figma">Figma</option>
                    </select>
                  </div>
                   <div>
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Tier</label>
                    <select 
                      value={newDrop.tier}
                      onChange={(e) => setNewDrop({...newDrop, tier: e.target.value})}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand/50"
                    >
                      <option value="Elite">Elite</option>
                      <option value="Pro">Pro</option>
                      <option value="Basic">Basic</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">URL / Source</label>
                  <input 
                    required
                    value={newDrop.url}
                    onChange={(e) => setNewDrop({...newDrop, url: e.target.value})}
                    type="url" 
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand/50"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" loading={isSubmitting} className="w-full">
                    Release Drop
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
