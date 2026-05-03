import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BlogPost } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Eye,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Link } from "@tanstack/react-router";

interface BlogTableProps {
  blogs: BlogPost[];
  onDelete: (id: string) => void;
  hasNextPage?: boolean;
  onNextPage?: () => void;
  loading?: boolean;
}

export function BlogTable({ 
  blogs, 
  onDelete, 
  hasNextPage, 
  onNextPage, 
  loading 
}: BlogTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No blog posts found.
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{blog.title}</span>
                      <span className="text-xs text-muted-foreground">{blog.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {blog.category?.name || "Uncategorized"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={blog.isPublished ? "default" : "secondary"}>
                      {blog.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {blog.author.firstName} {blog.author.lastName}
                  </TableCell>
                  <TableCell>
                    {format(new Date(blog.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/content/blog/${blog.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this post?")) {
                              onDelete(blog.id);
                            }
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <a 
                            href={`${import.meta.env.VITE_STOREFRONT_URL || ""}/blog/${blog.slug}`} 
                            target="_blank" 
                            rel="noreferrer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View on Storefront
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {hasNextPage && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={loading}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
