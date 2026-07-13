'use client'

import { useState } from 'react'
import { Star, MessageSquare, Plus, RefreshCw, AlertCircle } from 'lucide-react'

export function GoogleBusinessProfileCard() {
  const [isConnected, setIsConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [reviews, setReviews] = useState([
    { id: '1', author: 'Vikram Mehta', rating: 5, comment: 'Amazing onboarding support! Very professional crew.', date: '2 days ago', reply: '' },
    { id: '2', author: 'Asha K.', rating: 4, comment: 'Great location and prompt service. Recommended.', date: '1 week ago', reply: 'Thank you Asha!' },
  ])
  const [draftPost, setDraftPost] = useState('')
  const [postSuccess, setPostSuccess] = useState(false)

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
    }, 1500)
  }

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draftPost) return
    setPostSuccess(true)
    setTimeout(() => {
      setPostSuccess(false)
      setDraftPost('')
    }, 2000)
  }

  const handleReplySubmit = (id: string, text: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: text } : r))
  }

  return (
    <div className="glass p-5 col-span-1 md:col-span-2 lg:col-span-3 mt-4">
      <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Platform Integrations</div>
          <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
            Google Business Profile
          </h3>
        </div>
        {isConnected ? (
          <span className="text-[10px] font-mono bg-teal/15 text-teal px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            Connected
          </span>
        ) : (
          <span className="text-[10px] font-mono bg-muted/20 text-muted-foreground px-2.5 py-0.5 rounded-full">
            Not Linked
          </span>
        )}
      </div>

      {!isConnected ? (
        <div className="flex flex-col md:flex-row items-center gap-6 py-4">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-semibold text-white">Sync your business profile with KaramcharHR</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Connect your Google Business account to manage customer reviews, publish announcements, and automatically sync your office location details directly from the HR directory settings.
            </p>
          </div>
          <button 
            onClick={() => setIsConnected(true)}
            className="btn btn-primary flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      ) : (
        <div className="space-y-6 pt-2">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-white/5 border border-border/20 rounded-xl">
              <span className="text-[9px] text-zinc-400 font-bold uppercase">Business Location</span>
              <h4 className="text-sm font-bold text-white mt-1 text-ellipsis overflow-hidden whitespace-nowrap">KaramcharHR Mumbai</h4>
              <span className="text-[9px] text-zinc-500 block text-ellipsis overflow-hidden whitespace-nowrap">Udyog Vihar, Phase V</span>
            </div>
            <div className="p-3 bg-white/5 border border-border/20 rounded-xl">
              <span className="text-[9px] text-zinc-400 font-bold uppercase">Average Rating</span>
              <h4 className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                4.8 <Star className="w-4 h-4 text-marigold fill-marigold" />
              </h4>
              <span className="text-[9px] text-zinc-500">Based on 32 reviews</span>
            </div>
            <div className="p-3 bg-white/5 border border-border/20 rounded-xl">
              <span className="text-[9px] text-zinc-400 font-bold uppercase">Search Visibility</span>
              <h4 className="text-sm font-bold text-white mt-1">+14.2%</h4>
              <span className="text-[9px] text-zinc-500">Viewed by 2,450 users</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reviews Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Recent Google Reviews
                </span>
              </div>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {reviews.map(review => (
                  <div key={review.id} className="p-3.5 bg-white/5 border border-border/10 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{review.author}</span>
                      <span className="text-[9px] text-zinc-500">{review.date}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-marigold fill-marigold' : 'text-zinc-600'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">{review.comment}</p>
                    
                    {review.reply ? (
                      <div className="mt-2 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[11px] text-indigo-400 font-semibold">
                        <span className="font-bold text-[9px] uppercase tracking-wide block text-zinc-400 mb-0.5">Your Response</span>
                        {review.reply}
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-2 pt-1 border-t border-border/10">
                        <input 
                          type="text" 
                          placeholder="Draft response..." 
                          id={`reply-input-${review.id}`}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-border/20 bg-bg-dark text-xs text-foreground outline-none focus:border-rose"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleReplySubmit(review.id, (e.target as HTMLInputElement).value)
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            const val = (document.getElementById(`reply-input-${review.id}`) as HTMLInputElement).value
                            if (val) handleReplySubmit(review.id, val)
                          }}
                          className="btn btn-secondary px-3 py-1.5 rounded-lg text-xs"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Create GMB Post & Sync Settings */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Publish Google My Business Post
              </span>
              <form onSubmit={handlePostSubmit} className="space-y-3">
                <textarea 
                  value={draftPost}
                  onChange={(e) => setDraftPost(e.target.value)}
                  placeholder="Draft updates, offers, or event announcements to post on Google Search & Maps..." 
                  className="w-full h-[100px] p-3 rounded-xl border border-border/20 bg-white/5 text-xs text-foreground outline-none focus:border-rose leading-relaxed font-medium resize-none"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-zinc-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Standard Google post rules apply
                  </span>
                  <button 
                    type="submit" 
                    className="btn btn-primary px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Publish Post
                  </button>
                </div>
                {postSuccess && (
                  <div className="p-2 bg-teal/10 border border-teal/20 text-teal text-xs rounded-lg text-center font-bold">
                    ✓ Google Business post published successfully!
                  </div>
                )}
              </form>

              <hr className="border-border/10 my-4" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    Directory Sync
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Automatically sync phone, address, and hours changes to Google.
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={handleSync}
                    className="btn btn-secondary flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold w-full sm:w-auto cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync Data
                  </button>
                  <button 
                    onClick={() => setIsConnected(false)}
                    className="btn btn-secondary text-zinc-500 hover:text-red-500 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Unlink
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
