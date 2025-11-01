"use client"
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BlogList } from "@/components/blog-list";
import TitleBar from "@/components/titlebar";
import { Pagination } from "@/components/ui/pagination";
import { Footer } from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Grid3X3, List } from "lucide-react";
const POSTS_PER_PAGE = 8;

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const handleDataLoaded = (count: number) => {
    setTotalPosts(count);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Stable event handlers to prevent re-renders
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleSortChange = useCallback((newSort: "newest" | "oldest" | "popular") => {
    setSortBy(newSort);
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  const handleViewModeChange = useCallback((newMode: "grid" | "list") => {
    setViewMode(newMode);
  }, []);

  return (
    <>
    <main className="flex-1 pt-2">
      <TitleBar title="Blog"/>
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6 backdrop-blur-sm">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Blog
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Latest Stories
              </h1>
              <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
                Thoughts, stories, and ideas from the things that spark my curiosity.
              </p>
            </motion.div>
          </div>

          {/* Search and Controls - Right Aligned on Large Screens */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-4 mb-8">
            {/* Controls Container - Right Aligned on Large Screens */}
            <motion.div 
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full lg:w-auto"
            >
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:justify-end">
                {/* Search Input */}
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10 h-10 text-sm w-full rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Controls row */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Sort Dropdown */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        handleSortChange(e.target.value as "newest" | "oldest" | "popular");
                        setIsDropdownOpen(false);
                      }}
                      onMouseDown={(e) => {
                        if (isDropdownOpen) {
                          e.preventDefault();
                          setIsDropdownOpen(false);
                        } else {
                          setIsDropdownOpen(true);
                        }
                      }}
                      onBlur={() => setIsDropdownOpen(false)}
                      className="appearance-none h-10 pl-4 pr-10 text-sm font-medium bg-background border border-border hover:border-primary/50 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-full sm:w-auto transition-all cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="popular">Most Popular</option>
                    </select>
                    <ChevronDown 
                      className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none transition-transform duration-300 ease-out ${
                        isDropdownOpen ? 'rotate-180' : 'rotate-0'
                      }`} 
                    />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex bg-muted/50 backdrop-blur-sm rounded-xl p-1 border border-border/50">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleViewModeChange("grid")}
                      className="h-8 w-9 p-0 rounded-lg"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleViewModeChange("list")}
                      className="h-8 w-9 p-0 rounded-lg"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <BlogList 
            currentPage={currentPage} 
            onDataLoaded={handleDataLoaded}
            searchTerm={searchTerm}
            sortBy={sortBy}
            viewMode={viewMode}
            showControls={false}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </section>
    </main>
      <div className="h-3">
    <Footer />
    </div>
    </>
  );
}
