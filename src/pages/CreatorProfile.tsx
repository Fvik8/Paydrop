import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Shield, MapPin, Link as LinkIcon, FileText, Lock, ChevronRight, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function CreatorProfile() {
  const { id } = useParams();
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [creatorUser, setCreatorUser] = useState<any>(null);
  const [creatorMeta, setCreatorMeta] = useState<any>(null);
  const [drops, setDrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Fetch User Info
        const userDoc = await getDoc(doc(db, 'users', id));
        if (!userDoc.exists()) {
          setLoading(false);
          return;
        }
        setCreatorUser(userDoc.data());

        // Fetch Creator Meta
        const metaDoc = await getDoc(doc(db, 'creators', id));
        if (metaDoc.exists()) {
          setCreatorMeta(metaDoc.data());
        }

        // Fetch Drops (Listing metadata is public in our refined design for teaser)
        const q = query(
          collection(db, 'drops'),
          where('creatorId', '==', id),
          orderBy('releasedAt', 'desc')
        );

        const unsub = onSnapshot(q, (snap) => {
          setDrops(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        setLoading(false);
        return () => unsub();
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-brand animate-pulse">LOADING_CREATOR_INTEL...</div>;
  if (!creatorUser) return <div className="min-h-screen flex items-center justify-center">Creator not found.</div>;

  return (
    <div className="min-h-screen bg-black">
      {/* Banner */}
      <div className="h-48 md:h-80 w-full bg-gradient-to-r from-brand/20 to-brand/5 relative overflow-hidden">
        {creatorMeta?.bannerImage ? (
          <img src={creatorMeta.bannerImage} className="w-full h-full object-cover opacity-50" alt="Banner" />
        ) : (
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar Info */}
          <div className="w-full md:w-80 shrink-0">
            <div className="premium-card p-8 text-center md:text-left">
              <div className="w-24 h-24 rounded-2xl bg-brand/20 border-2 border-brand mx-auto md:mx-0 mb-6 overflow-hidden glow-indigo">
                <img src={creatorUser.photoURL} alt={creatorUser.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <h1 className="text-2xl font-bold mb-1">{creatorUser.displayName}</h1>
              <p className="text-brand text-xs font-bold uppercase tracking-widest mb-4">Elite Creator</p>
              
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                {creatorMeta?.bio || "This elite creator hasn't set a bio yet. Stay tuned for exclusive drops."}
              </p>

              <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60">
                   <MapPin className="w-3 h-3" /> Digital Domain
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60">
                   <LinkIcon className="w-3 h-3" /> paydrop.io/{creatorUser.displayName.toLowerCase().replace(' ', '')}
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate('/')}>
                  Subscribe $49/mo
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Share2 className="w-4 h-4" /> Share Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content (Drops Feed) */}
          <div className="flex-grow space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">The Vault <span className="text-brand">({drops.length})</span></h2>
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                <button className="px-3 py-1 text-xs font-bold text-white bg-white/10 rounded">All Drops</button>
                <button className="px-3 py-1 text-xs font-bold text-white/40 hover:text-white">Assets</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drops.map((drop, i) => (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="premium-card p-6 group cursor-pointer relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                      <FileText className="w-6 h-6 text-brand" />
                    </div>
                    <div className="px-2 py-1 rounded bg-brand/10 border border-brand/20 text-[10px] font-bold text-brand uppercase tracking-tighter">
                      {drop.tier} Only
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2 group-hover:text-brand transition-colors">{drop.title}</h3>
                  <p className="text-white/40 text-xs mb-6 line-clamp-2">Exclusive content for subscribers. Join the elite tier to unlock this resource and more.</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Released Oct 2024</span>
                    <div className="flex items-center gap-1 text-xs font-bold text-white/60 group-hover:text-white transition-colors">
                      Unlock <Lock className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Glass overlay fade if not signed in / subscribed (simulated) */}
                  <div className="absolute right-[-10%] bottom-[-10%] w-32 h-32 bg-brand/5 blur-2xl rounded-full group-hover:bg-brand/10 transition-colors" />
                </motion.div>
              ))}

              {drops.length === 0 && (
                <div className="col-span-full premium-card p-12 text-center border-dashed border-white/10">
                  <Shield className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 font-medium italic">"The vault is currently sealed. No drops detected."</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
