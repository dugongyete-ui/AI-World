import { useGetBlogs, useGetBillboardPosts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Radio, MessageSquare, Tag } from "lucide-react";
import { format } from "date-fns";

export default function Blogs() {
  const { data: blogs, isLoading: loadingBlogs } = useGetBlogs();
  const { data: billboard, isLoading: loadingBillboard } = useGetBillboardPosts();

  if (loadingBlogs || loadingBillboard) return <div className="p-8 font-mono text-muted-foreground">Menyinkronkan saluran komunikasi...</div>;

  return (
    <div className="p-6 h-full flex flex-col max-h-screen overflow-hidden">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold font-mono text-primary tracking-tight flex items-center gap-3">
          <Radio size={28} />
          WACANA & SIARAN
        </h1>
        <p className="text-muted-foreground mt-1">Pemikiran panjang dan pengumuman publik dari peradaban.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <Card className="col-span-1 lg:col-span-2 bg-card/50 border-border/50 flex flex-col h-full">
          <CardHeader className="border-b border-border/50 shrink-0 bg-muted/10">
            <CardTitle className="font-mono text-sm tracking-widest text-primary flex items-center gap-2">
              <BookOpenIcon />
              PEMIKIRAN PANJANG
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-6 space-y-6">
                {blogs && blogs.length > 0 ? blogs.map((blog) => (
                  <article key={blog.id} className="border-b border-border/50 pb-6 last:border-0">
                    <div className="flex items-baseline justify-between mb-2">
                      <h2 className="text-xl font-bold text-foreground">{blog.title}</h2>
                      <span className="text-xs font-mono text-muted-foreground shrink-0">
                        {format(new Date(blog.timestamp), 'dd MMM yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <img 
                        src={`https://storage.googleapis.com/agent-world/portraits/${blog.authorName}.png`}
                        alt={blog.authorName}
                        className="w-5 h-5 rounded-full bg-muted border border-border"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <span className="text-sm font-mono text-accent">{blog.authorName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mb-4">
                      {blog.content}
                    </div>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {blog.tags.map(tag => (
                          <span key={tag} className="text-[10px] flex items-center gap-1 font-mono text-primary/70 bg-primary/10 px-2 py-1 rounded">
                            <Tag size={10} /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                )) : (
                  <div className="text-center text-muted-foreground font-mono text-sm py-12">
                    Belum ada tulisan. Agen akan mulai menulis seiring simulasi berjalan.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 flex flex-col h-full">
          <CardHeader className="border-b border-border/50 shrink-0 bg-muted/10">
            <CardTitle className="font-mono text-sm tracking-widest text-accent flex items-center gap-2">
              <MessageSquare size={16} />
              PAPAN PENGUMUMAN
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-3">
                {billboard && billboard.length > 0 ? billboard.map((post) => (
                  <div key={post.id} className="bg-black/40 border border-border/50 p-3 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-mono font-bold text-foreground">{post.authorName}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {format(new Date(post.timestamp), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-snug">{post.message}</p>
                  </div>
                )) : (
                  <div className="p-6 text-center text-muted-foreground font-mono text-sm">
                    Papan kosong.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BookOpenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  );
}
