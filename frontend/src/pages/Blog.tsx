import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Top 10 Must-Visit Spots in the City",
      excerpt: "Discover the hidden gems and popular attractions that make our city special. From historic landmarks to trendy cafes, this guide has everything you need.",
      author: "Maria Rodriguez",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "Travel Tips",
      featured: true,
    },
    {
      id: 2,
      title: "Winter Special: 20% Off Extended Stays",
      excerpt: "Planning a longer stay? Take advantage of our winter special offer and save on accommodations while enjoying the cozy atmosphere of Happy Hostel.",
      author: "James Chen",
      date: "2024-01-10",
      readTime: "2 min read",
      category: "Offers",
      featured: false,
    },
    {
      id: 3,
      title: "Budget Travel Guide: Making the Most of $30/Day",
      excerpt: "Traveling on a tight budget? Our expert tips will help you experience the city without breaking the bank. Learn insider secrets from our staff.",
      author: "Sophie Williams",
      date: "2024-01-08",
      readTime: "7 min read",
      category: "Budget Travel",
      featured: false,
    },
    {
      id: 4,
      title: "Guest Spotlight: Amazing Stories from Around the World",
      excerpt: "Meet Sarah from Australia who traveled solo for 6 months and shares her incredible journey and tips for fellow solo travelers.",
      author: "Luna Garcia",
      date: "2024-01-05",
      readTime: "4 min read",
      category: "Guest Stories",
      featured: false,
    },
    {
      id: 5,
      title: "How to Pack Light for Hostel Travel",
      excerpt: "Master the art of packing light without sacrificing comfort. Our comprehensive guide covers everything from clothing to gadgets.",
      author: "Alex Thompson",
      date: "2024-01-03",
      readTime: "6 min read",
      category: "Travel Tips",
      featured: false,
    },
    {
      id: 6,
      title: "New Year, New Adventures: 2024 Activity Calendar",
      excerpt: "Check out our exciting lineup of activities, tours, and events planned for 2024. From cooking classes to hiking adventures, there's something for everyone.",
      author: "David Kim",
      date: "2024-01-01",
      readTime: "3 min read",
      category: "Updates",
      featured: false,
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Travel Tips": return "bg-blue-100 text-blue-800";
      case "Offers": return "bg-green-100 text-green-800";
      case "Budget Travel": return "bg-yellow-100 text-yellow-800";
      case "Guest Stories": return "bg-purple-100 text-purple-800";
      case "Updates": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Blog & News
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay updated with travel tips, special offers, guest stories, and the latest news from Happy Hostel.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Post */}
        {featuredPost && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Featured Story</h2>
            <Card className="p-8 shadow-warm">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className={getCategoryColor(featuredPost.category)} variant="secondary">
                    {featuredPost.category}
                  </Badge>
                  <h3 className="text-3xl font-bold text-foreground mt-4 mb-4">
                    {featuredPost.title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center space-x-2">
                      <User size={14} />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={14} />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90">
                    Read Full Article
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
                <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                  <span className="text-muted-foreground">Featured Image</span>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Blog Grid */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Latest Posts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Card key={post.id} className="p-6 shadow-soft hover:shadow-warm transition-shadow">
                <div className="mb-4">
                  <Badge className={getCategoryColor(post.category)} variant="secondary">
                    {post.category}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <User size={12} />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  Read More
                  <ArrowRight size={14} className="ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="mt-16 text-center bg-card p-12 rounded-2xl shadow-soft">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Stay in the Loop
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest travel tips, special offers, 
            and updates from Happy Hostel.
          </p>
          <div className="flex max-w-md mx-auto space-x-2">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="bg-primary hover:bg-primary/90">
              Subscribe
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Blog;